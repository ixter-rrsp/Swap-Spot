import { notFound } from "next/navigation";

import {
  getSwapRequestById,
} from "@/lib/services/ServerSwapRequestDetail";

import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import RequestStatus from "@/app/components/SwapRequests/RequestStatus/RequestStatus";
import RequestUsers from "@/app/components/SwapRequests/RequestUsers/RequestUsers";
import RequestListings from "@/app/components/SwapRequests/RequestListings/RequestListings";
import RequestMessage from "@/app/components/SwapRequests/RequestMessage/RequestMessage";
import RequestActions from "@/app/components/SwapRequests/RequestActions/RequestActions";

import styles from "./page.module.css";

// A swap request's status can flip at any moment for reasons that have
// nothing to do with the viewer's own actions — most notably, someone
// accepting a competing offer on the same listing auto-cancels this one
// server-side. This page must therefore never be served from a cached
// render (server Full Route Cache, or a stale client Router Cache entry
// from having visited it earlier while it was still pending) — always
// hit the DB fresh.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SwapRequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SwapRequestDetailPage({
  params,
}: SwapRequestDetailPageProps) {

  const { id } = await params;

  let request: SwapRequestDetail;

  try {

    request =
      await getSwapRequestById(id);

  } catch (error) {

    console.error(error);

    notFound();

  }

  return (
    <main className={styles.container}>

      <PageHeader
        title="Swap Request"
        showBack
      />

      <RequestStatus
        status={request.status}
      />

      <RequestUsers
        sender={request.sender}
        receiver={request.receiver}
      />

      <RequestListings
        offeredListing={request.offeredListing}
        requestedListing={request.requestedListing}
      />

      <RequestMessage
        message={request.message}
      />

      <RequestActions
        request={request}
      />

    </main>
  );
}