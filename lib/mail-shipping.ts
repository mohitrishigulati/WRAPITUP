import { orderShippingUpdateEmail } from "@/emails/shipping-update";

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[resend:shipping]", { to: input.to, subject: input.subject, text: input.text });
      return;
    }
    throw new Error("Resend is not configured");
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function sendShippingUpdateEmail(input: {
  to: string;
  orderNumber: string;
  trackingNumber: string | null;
}) {
  const { subject, html, text } = orderShippingUpdateEmail(input);
  await sendViaResend({ to: input.to, subject, html, text });
}
