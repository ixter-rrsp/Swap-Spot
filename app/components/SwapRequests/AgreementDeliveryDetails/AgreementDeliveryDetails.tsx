import { SwapAgreement } from "@/lib/types/SwapAgreement";
import styles from "./AgreementDeliveryDetails.module.css";

interface AgreementDeliveryDetailsProps {
  agreement: SwapAgreement;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  needs_repair: "Needs Repair",
};

function formatOptionalValue(value?: string | null) {
  return value?.trim() ? value : "To be shared";
}

export default function AgreementDeliveryDetails({
  agreement,
}: AgreementDeliveryDetailsProps) {
  const isMeetup = agreement.deliveryMethod === "meetup";

  return (
    <section className={styles.section}>
      <div className={styles.summaryCard}>
        <p className={styles.summaryTitle}>{isMeetup ? "Meetup handoff" : "Delivery handoff"}</p>
        <p className={styles.summaryText}>
          {isMeetup
            ? "Use the meetup details below to make the handoff simple, clear, and easy to find."
            : "Use the pickup and drop-off details below to keep the delivery process moving smoothly."}
        </p>
      </div>

      <h3 className={styles.heading}>{isMeetup ? "Meetup Details" : "Delivery Details"}</h3>

      {isMeetup ? (
        <div className={styles.grid}>
          <div>
            <p className={styles.label}>Meeting Place</p>
            <p className={styles.value}>{formatOptionalValue(agreement.meetupLocation)}</p>
          </div>
          <div>
            <p className={styles.label}>Date</p>
            <p className={styles.value}>{formatOptionalValue(agreement.meetupDate)}</p>
          </div>
          <div>
            <p className={styles.label}>Time</p>
            <p className={styles.value}>{formatOptionalValue(agreement.meetupTime)}</p>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <div>
            <p className={styles.label}>Pickup Address</p>
            <p className={styles.value}>{formatOptionalValue(agreement.pickupAddress)}</p>
          </div>
          <div>
            <p className={styles.label}>Drop-off Address</p>
            <p className={styles.value}>{formatOptionalValue(agreement.dropoffAddress)}</p>
          </div>
        </div>
      )}

      <h3 className={styles.heading}>Contact Info</h3>
      <div className={styles.grid}>
        <div>
          <p className={styles.label}>Requester</p>
          <p className={styles.value}>{formatOptionalValue(agreement.phoneRequester)}</p>
          <p className={styles.value}>{formatOptionalValue(agreement.emailRequester)}</p>
        </div>
        <div>
          <p className={styles.label}>Receiver</p>
          <p className={styles.value}>{formatOptionalValue(agreement.phoneReceiver)}</p>
          <p className={styles.value}>{formatOptionalValue(agreement.emailReceiver)}</p>
        </div>
      </div>

      <h3 className={styles.heading}>Item Condition</h3>
      <div className={styles.grid}>
        <div>
          <p className={styles.label}>Requester's Item</p>
          <p className={styles.value}>
            {agreement.requesterCondition
              ? CONDITION_LABELS[agreement.requesterCondition]
              : "—"}
          </p>
          {agreement.requesterAccessories && (
            <p className={styles.value}>{agreement.requesterAccessories}</p>
          )}
        </div>
        <div>
          <p className={styles.label}>Receiver's Item</p>
          <p className={styles.value}>
            {agreement.receiverCondition
              ? CONDITION_LABELS[agreement.receiverCondition]
              : "—"}
          </p>
          {agreement.receiverAccessories && (
            <p className={styles.value}>{agreement.receiverAccessories}</p>
          )}
        </div>
      </div>

      {agreement.notes && (
        <>
          <h3 className={styles.heading}>Notes</h3>
          <p className={styles.value}>{agreement.notes}</p>
        </>
      )}
    </section>
  );
}