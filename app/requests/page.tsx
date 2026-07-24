import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getIncomingRequests,
  getOutgoingRequests,
} from "@/lib/services/ServerSwapRequestService";
import RequestPageClient from "./RequestPageClient";
import styles from "./page.module.css";

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

      <header className={styles.header}>

        <h1>
          Swap Requests
        </h1>

        <p>
          Manage your incoming and outgoing swap requests.
        </p>

      </header>


      <RequestPageClient
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
      />

    </main>
  );
}