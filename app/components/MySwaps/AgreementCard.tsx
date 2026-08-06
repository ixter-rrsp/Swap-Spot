import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeftRight } from "lucide-react";
import styles from "./AgreementCard.module.css";
import type { SwapAgreementListDetail } from "@/lib/services/ServerSwapAgreementService";

interface ReviewStatus {
  currentUserReviewed: boolean;
  bothReviewed: boolean;
}

interface AgreementCardProps {
  agreement: SwapAgreementListDetail;
  reviewStatus?: ReviewStatus;
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function getNextStep(status: string) {
  switch (status) {
    case "pending_confirmation":
      return "Confirm the agreement and lock in the handoff.";
    case "confirmed":
      return "Complete the exchange and close the swap.";
    case "completed":
      return "Swap completed. Share a review if you want.";
    case "cancelled":
      return "This agreement was cancelled.";
    default:
      return "Keep the handoff details clear and up to date.";
  }
}

function formatDeliveryMethod(method: string) {
  switch (method) {
    case "meetup":
      return "Meetup";
    case "other_courier":
      return "Courier";
    default:
      return method;
  }
}

export default function AgreementCard({ agreement, reviewStatus }: AgreementCardProps) {
  const statusLabel = getStatusLabel(agreement.status);
  const nextStep = getNextStep(agreement.status);
  const deliveryLabel = formatDeliveryMethod(agreement.deliveryMethod);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          {agreement.otherUser.avatarUrl ? (
            <Image
              src={agreement.otherUser.avatarUrl}
              alt={agreement.otherUser.username}
              width={48}
              height={48}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {agreement.otherUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className={styles.userName}>{agreement.otherUser.fullName || agreement.otherUser.username}</h3>
            <p className={styles.userUsername}>@{agreement.otherUser.username}</p>
          </div>
        </div>
        <span className={`${styles.status} ${styles[agreement.status]}`}>
          {statusLabel}
        </span>
      </div>

      <div className={styles.swapContainer}>
        <ListingPreview
          title={agreement.offeredListing.title}
          imageUrl={agreement.offeredListing.imageUrl}
          label="You offered"
        />
        <div className={styles.swapArrow}><ArrowLeftRight size={18} /></div>
        <ListingPreview
          title={agreement.requestedListing.title}
          imageUrl={agreement.requestedListing.imageUrl}
          label="You requested"
        />
      </div>

      <div className={styles.nextStep}>{nextStep}</div>

      <div className={styles.details}>
        <p><strong>Method:</strong> {deliveryLabel}</p>
        <p><strong>Updated:</strong> {new Date(agreement.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
        <p className={styles.metaPill}><MapPin size={14} /> {agreement.meetupLocation || agreement.pickupAddress || "Location shared"}</p>
      </div>

      <div className={styles.actions}>
        <Link href={`/agreements/${agreement.id}`} className={styles.actionButton}>
          Open Agreement
        </Link>
        {reviewStatus && !reviewStatus.currentUserReviewed && (
          <Link href={`/reviews/${agreement.id}`} className={styles.reviewButton}>
            Leave a Review
          </Link>
        )}
        {reviewStatus && reviewStatus.currentUserReviewed && (
          <span className={styles.reviewButtonDone}>
            {reviewStatus.bothReviewed ? "Both Reviewed ✓" : "Review Submitted ✓"}
          </span>
        )}
      </div>
    </article>
  );
}

interface ListingPreviewProps {
  title: string;
  imageUrl?: string;
  label: string;
}

function ListingPreview({ title, imageUrl, label }: ListingPreviewProps) {
  return (
    <div className={styles.listing}>
      <span className={styles.listingLabel}>{label}</span>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={90}
          height={90}
          className={styles.image}
        />
      ) : (
        <div className={styles.imagePlaceholder}>No Image</div>
      )}
      <h4 className={styles.listingTitle}>{title}</h4>
    </div>
  );
}
