type PasswordResetEmailParams = {
  resetUrl: string;
  userName?: string | null;
};

export function passwordResetEmail({
  resetUrl,
  userName,
}: PasswordResetEmailParams) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";

  const subject = "Reset your WrapItUp password";
  const text = `${greeting}

We received a request to reset your password. Open this link to choose a new password (valid for 1 hour):

${resetUrl}

If you did not request this, you can ignore this email.`;

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>${greeting}</p>
    <p>We received a request to reset your password.</p>
    <p><a href="${resetUrl}">Reset your password</a> (link expires in 1 hour).</p>
    <p>If you did not request this, you can ignore this email.</p>
  </body>
</html>`;

  return { subject, text, html };
}
