import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getIncomingRequests,
  getOutgoingRequests,
} from "@/lib/services/ServerSwapRequestService";
import RequestPageClient from "./RequestPageClient";
import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const incomingRequests =
    await getIncomingRequests();


  const outgoingRequests =
    await getOutgoingRequests();


  return (
    <main className={styles.container}>
      <PageHeader title="Swap Requests" subtitle="Manage your incoming and outgoing swap requests." />

      <RequestPageClient
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
      />

    </main>
  );
}