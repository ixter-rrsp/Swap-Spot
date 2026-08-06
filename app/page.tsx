import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LandingPage from "@/app/components/Landing/LandingPage";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return <LandingPage />;
}
