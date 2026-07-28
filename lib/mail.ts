import { passwordResetEmail } from "@/emails/password-reset";
import { sendMail } from "@/lib/mail-transactional";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string | null,
) {
  const { subject, html, text } = passwordResetEmail({
    resetUrl,
    userName,
  });
  await sendMail({ to, subject, html, text });
}
