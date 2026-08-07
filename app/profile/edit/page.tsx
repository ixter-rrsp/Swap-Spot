import { redirect } from "next/navigation";
import EditProfileForm from "@/app/components/Profile/EditProfileForm/EditProfileForm";
import LinkedAccounts from "@/app/components/Profile/LinkedAccounts/LinkedAccounts";
import VerificationCard from "@/app/components/Profile/VerificationCard/VerificationCard";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import { getCurrentProfile } from "@/lib/services/ProfileService";
import styles from "./page.module.css";

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.content}>
          <PageHeader
            title="Edit Profile"
            subtitle="Update your profile and swap preferences"
            showBack
            align="center"
          />
          <EditProfileForm profile={profile} />
          <VerificationCard isVerified={profile.isVerified} />
          <LinkedAccounts />
        </div>
      </main>
    </>
  );
}