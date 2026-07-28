"use client";

import { useState } from "react";
import { WHATSAPP_INTENTS, whatsAppUrl } from "@/lib/store/storefront-config";

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const numberConfigured = Boolean(whatsAppUrl("test"));

  if (!numberConfigured) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open ? (
        <div className="w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-zinc-900">Chat on WhatsApp</p>
          <p className="mt-1 text-xs text-zinc-600">Pick a topic — we&apos;ll open WhatsApp with a pre-filled message.</p>
          <ul className="mt-3 space-y-2">
            {WHATSAPP_INTENTS.map((intent) => {
              const href = whatsAppUrl(intent.message);
              if (!href) return null;
              return (
                <li key={intent.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100"
                  >
                    {intent.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full text-center text-xs text-zinc-500 hover:text-zinc-800"
          >
            Close
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:scale-105"
        aria-label="WhatsApp support"
      >
        💬
      </button>
    </div>
  );
}
