"use server";

import { hash } from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { sanitizeReviewText } from "@/lib/sanitize";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validators/auth";
import type { ActionResult } from "@/types/actions";
import { AuthError } from "next-auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

async function enforceAuthRateLimit(action: string, limit: number, windowMs: number) {
  const ip = await getClientIp();
  const allowed = checkRateLimit(rateLimitKey(action, ip), { limit, windowMs });
  if (!allowed) {
    return {
      ok: false as const,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }
  return null;
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function fieldErrorsFromZod(
  error: { flatten: () => { fieldErrors: Record<string, string[]> } },
) {
  return error.flatten().fieldErrors;
}

export async function signupAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const limited = await enforceAuthRateLimit("signup", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: ["An account with this email already exists"] },
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      name: sanitizeReviewText(parsed.data.name) ?? parsed.data.name,
      email,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Account created but sign-in failed. Try logging in." };
    }
    throw error;
  }

  return { ok: true };
}

export async function loginAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const limited = await enforceAuthRateLimit("login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  const callbackUrl = String(formData.get("callbackUrl") ?? "").trim();
  const redirectTo =
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.includes("\\")
      ? callbackUrl
      : "/";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password" };
    }
    throw error;
  }

  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const limited = await enforceAuthRateLimit("forgot-password", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await db.passwordResetToken.create({
      data: { userId: user.id, token: tokenHash, expiresAt },
    });

    const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(email, resetUrl, user.name);
  }

  return {
    ok: true,
    message:
      "If an account exists for that email, we sent password reset instructions.",
  };
}

export async function resetPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const limited = await enforceAuthRateLimit("reset-password", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const record = await db.passwordResetToken.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    return {
      ok: false,
      message: "This reset link is invalid or has expired.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return {
    ok: true,
    message: "Your password has been updated. You can sign in now.",
  };
}
