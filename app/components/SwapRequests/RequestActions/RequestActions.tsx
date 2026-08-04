"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import ConfirmDialog from "@/app/components/UI/ConfirmDialog/ConfirmDialog";

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
  const [status, setStatus] = useState(request.status);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const router = useRouter();
  const toast = useToast();


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

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error(
        "Request failed."
      );
    }
  }

  function applyStatus(nextStatus: typeof request.status) {
    setStatus(nextStatus);
    router.refresh();
  }



  function handleAccept() {

    startTransition(async () => {

      try {

        await sendAction(
          "accept"
        );

        applyStatus("accepted");
        toast("Swap request accepted.", "success");

      } catch (error) {

        console.error(error);

        toast(
          "Failed to accept swap request.",
          "error"
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

        applyStatus("declined");
        toast("Swap request declined.", "success");

      } catch (error) {

        console.error(error);

        toast(
          "Failed to decline swap request.",
          "error"
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

        applyStatus("cancelled");
        toast("Swap request cancelled.", "success");

      } catch (error) {

        console.error(error);

        toast(
          "Failed to cancel swap request.",
          "error"
        );

      }

    });

  }




  if (
    status === "pending" &&
    isReceiver
  ) {

    return (

      <section className={styles.container}>

        <button
          className={styles.acceptButton}
          disabled={isPending}
          onClick={() => setShowAcceptConfirm(true)}
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

        {showAcceptConfirm && (
          <ConfirmDialog
            title="Accept this swap?"
            message="Once you accept, your item will be hidden from other users and unavailable for other swaps unless this one is cancelled."
            confirmLabel="Accept Swap"
            confirmDisabled={isPending}
            onConfirm={() => {
              setShowAcceptConfirm(false);
              handleAccept();
            }}
            onCancel={() => setShowAcceptConfirm(false)}
          />
        )}

      </section>

    );

  }



  if (
    status === "pending" &&
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
    status === "accepted"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          Waiting for the next step.
        </div>

      </section>

    );

  }



  if (
    status === "declined"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          This swap request was declined.
        </div>

      </section>

    );

  }



  if (
    status === "completed"
  ) {

    return (

      <section className={styles.container}>

        <div className={styles.statusCard}>
          This swap is already complete.
        </div>

      </section>

    );

  }



  if (
    status === "cancelled"
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