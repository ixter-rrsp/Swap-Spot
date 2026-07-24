import { redirect } from "next/navigation";
import EditProfileForm from "@/app/components/Profile/EditProfileForm/EditProfileForm"; 
import { getCurrentProfile } from "@/lib/services/ProfileService"; 

export default async function EditProfilePage() { 
  const profile = await getCurrentProfile(); 
  if (!profile) { 
    redirect("/login"); 
  } 
  return <EditProfileForm profile={profile} />; 
}