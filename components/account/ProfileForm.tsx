"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/types/actions";
import { updateProfileAction } from "@/actions/profile";

const initialState: ActionResult = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

type ProfileFormProps = {
  name: string | null;
  email: string;
};

export function ProfileForm({ name, email }: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Profile</h2>
      <label className="block text-sm font-medium text-zinc-800">
        Name
        <input
          name="name"
          defaultValue={name ?? ""}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {state.fieldErrors?.name?.map((msg) => (
          <span key={msg} className="mt-1 block text-sm text-red-600">
            {msg}
          </span>
        ))}
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Email
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {state.fieldErrors?.email?.map((msg) => (
          <span key={msg} className="mt-1 block text-sm text-red-600">
            {msg}
          </span>
        ))}
      </label>
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
  );
}
