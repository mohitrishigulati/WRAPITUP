import "server-only";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function sendViaResend(input: SendMailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

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
  return true;
}

async function sendViaSmtp(input: SendMailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  if (!host || !user || !pass || !from) return false;

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transport.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text });
  return true;
}

/** Password reset + other SMTP-labelled mail. Prefers Resend when configured. */
export async function sendMail(input: SendMailInput) {
  const sent =
    (await sendViaResend(input).catch(() => false)) ||
    (await sendViaSmtp(input).catch(() => false));

  if (sent) return;

  if (process.env.NODE_ENV === "development") {
    console.info("[mail:dev]", { to: input.to, subject: input.subject, text: input.text });
    return;
  }

  throw new Error("Email is not configured");
}
