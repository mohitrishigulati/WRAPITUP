import "server-only";

export function getSiteUrl() {
  const explicit = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (explicit?.trim()) return explicit.trim().replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
