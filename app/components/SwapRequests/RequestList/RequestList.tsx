"use client";

import RequestCard from "../RequestCard/RequestCard";

import EmptyState from "@/app/components/UI/EmptyState/EmptyState";

import type { SwapRequest } from "@/lib/types/SwapRequest";

import styles from "./RequestList.module.css";


interface RequestListProps {
  requests: SwapRequest[];

  isIncoming: boolean;

  onAccept?: (id: string) => void;

  onDecline?: (id: string) => void;
}


export default function RequestList({
  requests,
  isIncoming,
  onAccept,
  onDecline,
}: RequestListProps) {

  if (requests.length === 0) {
    return (
      <EmptyState
        title={
          isIncoming
            ? "No incoming requests"
            : "No outgoing requests"
        }
        description={
          isIncoming
            ? "You don't have any swap requests yet."
            : "You haven't sent any swap requests yet."
        }
      />
    );
  }


  return (
    <section className={styles.container}>

      {requests.map((request) => (

        <RequestCard
          key={request.id}
          request={request}
          isIncoming={isIncoming}
          onAccept={onAccept}
          onDecline={onDecline}
        />

      ))}

    </section>
  );
}