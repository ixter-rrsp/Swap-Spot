import EditProfileForm from "@/app/components/Profile/EditProfileForm/EditProfileForm"; 
import { getCurrentProfile } from "@/lib/services/ProfileService"; 
import Styles  from "./page.module.css";

export default async function EditProfilePage() 
  { const profile = await getCurrentProfile(); 
    if (!profile) { return null; } 
    return <EditProfileForm profile={profile} />; 
  }