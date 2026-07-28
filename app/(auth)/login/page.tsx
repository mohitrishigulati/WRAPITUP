import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isGoogleOAuthConfigured } from "@/lib/auth/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Sign-in is misconfigured on the server. Ensure AUTH_SECRET, DATABASE_URL, and Google OAuth env vars are set on Vercel, and run the database schema.",
  AccessDenied: "Access was denied. Try another account or sign in with email.",
  OAuthSignin: "Could not start Google sign-in. Check Google OAuth client settings.",
  OAuthCallback: "Google sign-in failed. Verify the redirect URI in Google Cloud Console.",
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with email/password first.",
  Default: "Sign-in failed. Please try again.",
};

type LoginPageProps = {
  searchParams: { callbackUrl?: string; error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl =
    searchParams.callbackUrl?.startsWith("/") &&
    !searchParams.callbackUrl.startsWith("//")
      ? searchParams.callbackUrl
      : undefined;

  const authError = searchParams.error
    ? (AUTH_ERROR_MESSAGES[searchParams.error] ?? AUTH_ERROR_MESSAGES.Default)
    : undefined;

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      authError={authError}
      showGoogleSignIn={isGoogleOAuthConfigured()}
    />
  );
}
