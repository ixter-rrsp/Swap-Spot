import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
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

export default function AgreementCard({ agreement, reviewStatus }: AgreementCardProps) {
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
          {agreement.status.replace("_", " ")}
        </span>
      </div>

      <div className={styles.swapContainer}>
        <ListingPreview
          title={agreement.offeredListing.title}
          imageUrl={agreement.offeredListing.imageUrl}
          label="You offered"
        />
        <div className={styles.swapArrow}>⇄</div>
        <ListingPreview
          title={agreement.requestedListing.title}
          imageUrl={agreement.requestedListing.imageUrl}
          label="You requested"
        />
      </div>

      <div className={styles.details}>
        <p><strong>Method:</strong> {agreement.deliveryMethod}</p>
        <p><strong>Updated:</strong> {new Date(agreement.updatedAt).toLocaleDateString()}</p>
        <p className={styles.metaPill}><MapPin size={14} /> {agreement.meetupLocation || agreement.pickupAddress || "Location shared"}</p>
      </div>

      <div className={styles.actions}>
        <Link href={`/agreements/${agreement.id}`} className={styles.actionButton}>
          View Agreement
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
