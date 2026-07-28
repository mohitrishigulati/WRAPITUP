"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionResult } from "@/types/actions";
import { forgotPasswordAction } from "@/actions/auth";
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
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We will email you a reset link"
      footer={
        <Link href="/login" className="font-medium text-zinc-900 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          errors={state.fieldErrors?.email}
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
      </form>
    </AuthShell>
  );
}
