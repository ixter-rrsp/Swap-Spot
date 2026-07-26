import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import NotificationCenter from "@/app/components/Notifications/NotificationCenter/NotificationCenter";
import styles from "./page.module.css";
import { getNotificationCategorySummaries } from "@/lib/services/ServerNotificationService";
import { getUserConversations } from "@/lib/services/ServerChatService";
import Navbar from "../components/Layout/Navbar/Navbar";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, conversations] = await Promise.all([
    getNotificationCategorySummaries(),
    getUserConversations(),
  ]);

  return (
    <>
      <main className={styles.container}>
        <NotificationCenter
          categories={categories}
          conversations={conversations}
        />
      </main>

      <Navbar />
    </>
  );
}
