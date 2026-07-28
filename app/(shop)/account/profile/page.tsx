import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { listAddressesForUser } from "@/lib/account/queries";
import { AccountNav, AccountShell } from "@/components/account/AccountNav";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressManager } from "@/components/account/AddressManager";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const sessionUser = await requireUser("/account/profile");
  const [user, addresses] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { name: true, email: true },
    }),
    listAddressesForUser(sessionUser.id),
  ]);

  return (
    <AccountShell
      title="Your account"
      description="Manage your profile and saved addresses."
      nav={<AccountNav current="profile" />}
    >
      <div className="space-y-10">
        <ProfileForm name={user.name} email={user.email} />
        <AddressManager addresses={addresses} />
      </div>
    </AccountShell>
  );
}
