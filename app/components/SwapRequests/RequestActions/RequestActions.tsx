"use client";

import { useEffect, useState, useTransition } from "react";
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

  // `status` is only seeded from `request.status` once, on mount —
  // useState's initializer doesn't re-run just because the parent
  // Server Component re-renders with a fresh `request` prop (e.g. from
  // the router.refresh() below). Without this, a request that gets
  // auto-cancelled elsewhere (someone accepted a competing offer on the
  // same listing) while this page is already open would keep showing
  // stale "pending" actions — including a Cancel button that fails the
  // moment it's clicked, since the server already knows it's cancelled.
  useEffect(() => {
    setStatus(request.status);
  }, [request.status]);

  // Keep this in sync with the server even if nothing the current user
  // does triggers a refresh — e.g. the other party accepts/declines, or
  // (per above) a competing request causes an auto-cancel.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 10000);

    function handleFocus() {
      router.refresh();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);


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
      const body = await response.json().catch(() => null);
      throw new Error(
        body?.error || "Request failed."
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
          error instanceof Error ? error.message : "Failed to accept swap request.",
          "error"
        );

        // The listing may have just been locked by someone else's accept,
        // or this request may no longer be pending — refresh to reflect
        // the real current state instead of leaving stale buttons up.
        router.refresh();

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

        const message =
          error instanceof Error ? error.message : "";

        if (message === "This swap request can no longer be cancelled.") {
          // The server already knows something we didn't yet — most
          // likely it was auto-cancelled (a competing offer got
          // accepted) or resolved some other way while this page was
          // open. Sync up instead of reporting a false failure.
          router.refresh();
          toast(
            "This request was already resolved — refreshing.",
            "error"
          );
          return;
        }

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