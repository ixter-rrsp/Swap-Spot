"use client";

import RequestCard from "@/app/components/SwapRequests/RequestCard/RequestCard";

import {
  acceptRequestAction,
  declineRequestAction,
} from "@/lib/actions/SwapRequestAction";

import { SwapRequest } from "@/lib/types/SwapRequest";


interface Props {
  incomingRequests: SwapRequest[];
  outgoingRequests: SwapRequest[];
}


export default function RequestPageClient({
  incomingRequests,
  outgoingRequests,
}: Props) {


  return (
    <>
      <section>
        <h2>Incoming</h2>

        {
          incomingRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isIncoming={true}
              onAccept={acceptRequestAction}
              onDecline={declineRequestAction}
            />
          ))
        }

      </section>


      <section>
        <h2>Outgoing</h2>

        {
          outgoingRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isIncoming={false}
            />
          ))
        }

      </section>
    </>
  );
}