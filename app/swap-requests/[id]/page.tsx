import { notFound } from "next/navigation";

import {
  getSwapRequestById,
} from "@/lib/services/ServerSwapRequestDetail";

import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

import RequestStatus from "@/app/components/SwapRequests/RequestStatus/RequestStatus";
import RequestUsers from "@/app/components/SwapRequests/RequestUsers/RequestUsers";
import RequestListings from "@/app/components/SwapRequests/RequestListings/RequestListings";
import RequestMessage from "@/app/components/SwapRequests/RequestMessage/RequestMessage";
import RequestActions from "@/app/components/SwapRequests/RequestActions/RequestActions";

import styles from "./page.module.css";

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