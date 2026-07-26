import { redirect } from "next/navigation";
import EditProfileForm from "@/app/components/Profile/EditProfileForm/EditProfileForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import { getCurrentProfile } from "@/lib/services/ProfileService";

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader title="Edit Profile" subtitle="Update your profile and swap preferences" />
      <EditProfileForm profile={profile} />
    </>
  );
}