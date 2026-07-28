"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionResult } from "@/types/actions";
import { resetPasswordAction } from "@/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";

const initialState: ActionResult = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This reset link is missing a token.">
        <Link href="/forgot-password" className="block text-center text-sm font-medium text-zinc-900">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Enter a strong password for your account">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <FormField
          id="password"
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          errors={state.fieldErrors?.password}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          errors={state.fieldErrors?.confirmPassword}
        />
        {state.message ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <SubmitButton />
        {state.ok ? (
          <p className="text-center text-sm">
            <Link href="/login" className="font-medium text-zinc-900 hover:underline">
              Sign in
            </Link>
          </p>
        ) : null}
      </form>
    </AuthShell>
  );
}
