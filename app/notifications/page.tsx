import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Navbar from "../components/Layout/Navbar/Navbar";
import styles from "./page.module.css";
import NotificationList from "@/app/components/Notifications/NotificationList/NotificationList";
import { getNotifications } from "@/lib/services/ServerNotificationService";
import MarkAllReadButton from "@/app/components/Notifications/MarkAllReadButton/MarkAllReadButton";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications =
    await getNotifications();

  return (
    <>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>
            Notifications
          </h1>

        <MarkAllReadButton />
        </header>

        <NotificationList
          notifications={notifications}
        />
      </main>

      <Navbar />
    </>
  );
}