"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SwapActions.module.css";
import CreateSwapRequest from "@/app/components/SwapRequests/CreateSwapRequest/CreateSwapRequest";
import MessageSellerButton from "@/app/components/Chat/MessageSellerButton";

interface SwapActionsProps {
  requestedListingId: string;
  hasPendingRequest: boolean;
  isAuthenticated?: boolean;
}

export default function SwapActions({
  requestedListingId,
  hasPendingRequest,
  isAuthenticated = true,
}: SwapActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleProposeSwap = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <section className={styles.container}>
        <MessageSellerButton 
          listingId={requestedListingId} 
          className={styles.secondaryButton} 
        />

        {
          hasPendingRequest ? (
            <button
              className={styles.primaryButton}
              disabled
            >
              Request Sent
            </button>
          ) : (
            <button
              className={styles.primaryButton}
              onClick={handleProposeSwap}
            >
              Propose a swap
            </button>
          )
        }
      </section>



      {
        open && (
          <CreateSwapRequest
            requestedListingId={requestedListingId}
            onClose={() =>
              setOpen(false)
            }
          />
        )
      }


    </>
  );
}