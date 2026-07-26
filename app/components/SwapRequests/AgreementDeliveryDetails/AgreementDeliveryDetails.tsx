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

export default function AgreementDeliveryDetails({
  agreement,
}: AgreementDeliveryDetailsProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Delivery</h3>

      {agreement.deliveryMethod === "meetup" ? (
        <div className={styles.grid}>
          <div>
            <p className={styles.label}>Meeting Place</p>
            <p className={styles.value}>{agreement.meetupLocation || "—"}</p>
          </div>
          <div>
            <p className={styles.label}>Date</p>
            <p className={styles.value}>{agreement.meetupDate || "—"}</p>
          </div>
          <div>
            <p className={styles.label}>Time</p>
            <p className={styles.value}>{agreement.meetupTime || "—"}</p>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <div>
            <p className={styles.label}>Pickup Address</p>
            <p className={styles.value}>{agreement.pickupAddress || "—"}</p>
          </div>
          <div>
            <p className={styles.label}>Drop-off Address</p>
            <p className={styles.value}>{agreement.dropoffAddress || "—"}</p>
          </div>
        </div>
      )}

      <h3 className={styles.heading}>Contact Info</h3>
      <div className={styles.grid}>
        <div>
          <p className={styles.label}>Requester</p>
          <p className={styles.value}>{agreement.phoneRequester || "—"}</p>
          <p className={styles.value}>{agreement.emailRequester || "—"}</p>
        </div>
        <div>
          <p className={styles.label}>Receiver</p>
          <p className={styles.value}>{agreement.phoneReceiver || "—"}</p>
          <p className={styles.value}>{agreement.emailReceiver || "—"}</p>
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