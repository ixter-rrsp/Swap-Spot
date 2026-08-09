import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import NotificationCenter from "@/app/components/Notifications/NotificationCenter/NotificationCenter";
import styles from "./page.module.css";
import { getNotificationCategorySummaries } from "@/lib/services/ServerNotificationService";
import { getUserConversations } from "@/lib/services/ServerChatService";
import Navbar from "../components/Layout/Navbar/Navbar";

// Without this, Next.js can serve a cached render of this page (via the
// client-side Router Cache) when navigating back to it, handing
// NotificationCenter/MessagesSection the same stale `conversations`
// snapshot from an earlier visit. useLiveConversations resets its live
// state to whatever `initialConversations` prop it receives, so a stale
// prop silently reverts an already-live-updated conversation card back
// to the old message. Forcing this route dynamic (matching
// app/messages/page.tsx) makes sure it's always refetched fresh.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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