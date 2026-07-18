"use client";

import { useTransition } from "react";

import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

import styles from "./RequestActions.module.css";


interface RequestActionsProps {
  request: SwapRequestDetail;
}


export default function RequestActions({
  request,
}: RequestActionsProps) {

  const [isPending, startTransition] =
    useTransition();


  const isSender =
    request.currentUserId === request.sender.id;


  const isReceiver =
    request.currentUserId === request.receiver.id;



  async function sendAction(
    action: "accept" | "decline" | "cancel"
  ) {

    const response =
      await fetch(
        `/api/swap-requests/${request.id}/${action}`,
        {
          method: "PATCH",
        }
      );


    if (!response.ok) {
      throw new Error(
        "Request failed."
      );
    }

  }



  function handleAccept() {

    startTransition(async () => {

      try {

        await sendAction(
          "accept"
        );

        window.location.reload();


      } catch (error) {

        console.error(error);

        alert(
          "Failed to accept swap request."
        );

      }

    });

  }



  function handleDecline() {

    startTransition(async () => {

      try {

        await sendAction(
          "decline"
        );

        window.location.reload();


      } catch (error) {

        console.error(error);

        alert(
          "Failed to decline swap request."
        );

      }

    });

  }



  function handleCancel() {

    startTransition(async () => {

      try {

        await sendAction(
          "cancel"
        );

        window.location.reload();


      } catch (error) {

        console.error(error);

        alert(
          "Failed to cancel swap request."
        );

      }

    });

  }




  if (
    request.status === "pending" &&
    isReceiver
  ) {

    return (

      <section className={styles.container}>

        <button
          className={styles.acceptButton}
          disabled={isPending}
          onClick={handleAccept}
        >
          Accept
        </button>


        <button
          className={styles.declineButton}
          disabled={isPending}
          onClick={handleDecline}
        >
          Decline
        </button>

      </section>

    );

  }



  if (
    request.status === "pending" &&
    isSender
  ) {

    return (

      <section className={styles.container}>

        <button
          className={styles.cancelButton}
          disabled={isPending}
          onClick={handleCancel}
        >
          Cancel Request
        </button>

      </section>

    );

  }



  if (
    request.status === "accepted"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          ✅ Swap Accepted
        </div>

      </section>

    );

  }



  if (
    request.status === "declined"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          ❌ Swap Declined
        </div>

      </section>

    );

  }



  if (
    request.status === "completed"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          ⭐ Swap Completed
        </div>

      </section>

    );

  }



  if (
    request.status === "cancelled"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          🚫 Swap Request Cancelled
        </div>

      </section>

    );

  }



  return null;

}