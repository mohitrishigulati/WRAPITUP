"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionResult } from "@/types/actions";
import { signupAction } from "@/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const initialState: ActionResult = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initialState);

  return (
    <AuthShell
      title="Create account"
      subtitle="Start shopping with WrapItUp"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormField
          id="name"
          label="Full name"
          name="name"
          autoComplete="name"
          required
          errors={state.fieldErrors?.name}
        />
        <FormField
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          errors={state.fieldErrors?.email}
        />
        <FormField
          id="password"
          label="Password"
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
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
        ) : null}
        <SubmitButton />
      </form>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-zinc-500">
          <span className="bg-white px-2">or</span>
        </div>
      </div>
      <GoogleSignInButton />
    </AuthShell>
  );
}
