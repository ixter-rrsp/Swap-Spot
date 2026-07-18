"use client";

import { useState } from "react";

import styles from "./SwapActions.module.css";

import CreateSwapRequest from "@/app/components/SwapRequests/CreateSwapRequest/CreateSwapRequest";


interface SwapActionsProps {
  requestedListingId: string;

  hasPendingRequest: boolean;

  onChat?: () => void;
}


export default function SwapActions({
  requestedListingId,
  hasPendingRequest,
  onChat,
}: SwapActionsProps) {

  const [open, setOpen] = useState(false);


  return (
    <>

      <section className={styles.container}>


        <button
          className={styles.secondaryButton}
          onClick={onChat}
        >
          Message
        </button>



        {
          hasPendingRequest ? (

            <button
              className={styles.primaryButton}
              disabled
            >
              Request Sent ✓
            </button>

          ) : (

            <button
              className={styles.primaryButton}
              onClick={() => {
                console.log("PROPOSE SWAP CLICKED");
                setOpen(true);
              }}
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