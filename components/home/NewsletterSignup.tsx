"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeNewsletterAction, type NewsletterState } from "@/actions/newsletter";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? "…" : "Subscribe"}
    </button>
  );
}

export function NewsletterSignup() {
  const [state, action] = useFormState(subscribeNewsletterAction, { ok: false } as NewsletterState);

  return (
    <section className="bg-brand-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Newsletter</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Sales, new arrivals, and return-gift ideas — no spam.
          </p>
          <form action={action} className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-full border border-zinc-300 px-4 py-2.5 text-sm sm:max-w-xs"
            />
            <SubmitButton />
          </form>
          {state.message ? (
            <p
              className={`mt-3 text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
