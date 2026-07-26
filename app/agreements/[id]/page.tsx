import { notFound } from "next/navigation";

import { getSwapAgreementById } from "@/lib/services/ServerSwapAgreementService";
import { getSwapRequestById } from "@/lib/services/ServerSwapRequestDetail";

import { SwapAgreementDetail } from "@/lib/types/SwapAgreementDetail";
import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

import AgreementStatus from "@/app/components/SwapRequests/AgreementStatus/AgreementStatus";
import RequestUsers from "@/app/components/SwapRequests/RequestUsers/RequestUsers";
import RequestListings from "@/app/components/SwapRequests/RequestListings/RequestListings";
import AgreementDeliveryDetails from "@/app/components/SwapRequests/AgreementDeliveryDetails/AgreementDeliveryDetails";
import AgreementActions from "@/app/components/SwapRequests/AgreementActions/AgreementActions";

import styles from "./page.module.css";

interface AgreementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgreementDetailPage({
  params,
}: AgreementDetailPageProps) {

  const { id } = await params;

  let agreement: SwapAgreementDetail;
  let swapRequest: SwapRequestDetail;

  try {

    agreement =
      await getSwapAgreementById(id);

    swapRequest =
      await getSwapRequestById(agreement.swapRequestId);

  } catch (error) {

    console.error(error);

    notFound();

  }

  return (
    <main className={styles.container}>

      <AgreementStatus
        status={agreement.status}
      />

      <RequestUsers
        sender={swapRequest.sender}
        receiver={swapRequest.receiver}
      />

      <RequestListings
        offeredListing={swapRequest.offeredListing}
        requestedListing={swapRequest.requestedListing}
      />

      <AgreementDeliveryDetails
        agreement={agreement}
      />

      <AgreementActions
        agreement={agreement}
      />

    </main>
  );
}