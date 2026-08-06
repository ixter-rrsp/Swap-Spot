"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./RequestCard.module.css";

import type { SwapRequest } from "@/lib/types/SwapRequest";

interface RequestCardProps {
  request: SwapRequest;

  isIncoming: boolean;

  onAccept?: (id: string) => void;

  onDecline?: (id: string) => void;

  hideActions?: boolean;

  href?: string;
}

export default function RequestCard({
  request,
  isIncoming,
  onAccept,
  onDecline,
  hideActions,
  href,
}: RequestCardProps) {

  const otherUser = isIncoming
    ? request.sender
    : request.receiver;


  if (!otherUser) {
    return null;
  }


  return (
    <article className={styles.card}>

      <div className={styles.header}>

        <div className={styles.user}>

          {otherUser.avatarUrl ? (

            <Image
              src={otherUser.avatarUrl}
              alt={otherUser.username}
              width={48}
              height={48}
              className={styles.avatar}
            />

          ) : (

            <div className={styles.avatarPlaceholder}>
              {otherUser.username
                .charAt(0)
                .toUpperCase()}
            </div>

          )}


          <div>

            <h3>
              {otherUser.fullName}
            </h3>

            <p>
              @{otherUser.username}
            </p>

          </div>

        </div>


        <span
          className={`${styles.status} ${styles[request.status]}`}
        >
          {request.status}
        </span>

      </div>


      <div className={styles.swapContainer}>


        <ListingPreview
          title={request.offeredListing.title}
          city={request.offeredListing.city}
          swapValue={request.offeredListing.swapValue}
          imageUrl={request.offeredListing.imageUrl}
        />


        <div className={styles.swapArrow}>
          ⇄
        </div>


        <ListingPreview
          title={request.requestedListing.title}
          city={request.requestedListing.city}
          swapValue={request.requestedListing.swapValue}
          imageUrl={request.requestedListing.imageUrl}
        />


      </div>


      {isIncoming &&
        request.status === "pending" && !hideActions && (

        <div className={styles.actions}>

          <button
            className={styles.accept}
            onClick={(e) => {
              e.preventDefault();
              onAccept?.(request.id);
            }}
          >
            Accept
          </button>


          <button
            className={styles.decline}
            onClick={(e) => {
              e.preventDefault();
              onDecline?.(request.id);
            }}
          >
            Decline
          </button>

        </div>

      )}

      {href && (
        <div className={styles.actions} style={{ marginTop: 8 }}>
          <Link
            href={href}
            className={styles.accept}
            style={{ backgroundColor: '#f0f4f8', color: '#007bff', textDecoration: 'none' }}
          >
            View Request
          </Link>
        </div>
      )}


    </article>
  );
}



interface ListingPreviewProps {
  title: string;
  city: string;
  swapValue: number;
  imageUrl?: string;
}


function ListingPreview({
  title,
  city,
  swapValue,
  imageUrl,
}: ListingPreviewProps) {

  return (

    <div className={styles.listing}>

      {imageUrl ? (

        <Image
          src={imageUrl}
          alt={title}
          width={90}
          height={90}
          className={styles.image}
        />

      ) : (

        <div className={styles.imagePlaceholder}>
          No Image
        </div>

      )}


      <h4>
        {title}
      </h4>


      <p>
        {city}
      </p>


      <strong>
        {swapValue.toLocaleString()}
      </strong>


    </div>

  );
}