import { requireUser } from "@/lib/auth/require-user";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return children;
}
