import { SwapAgreementStatus } from "@/lib/types/SwapAgreementStatus";
import styles from "./AgreementStatus.module.css";

interface AgreementStatusProps {
  status: SwapAgreementStatus;
}

const STATUS_LABELS: Record<SwapAgreementStatus, string> = {
  draft: "Draft",
  pending_confirmation: "Awaiting Confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AgreementStatus({ status }: AgreementStatusProps) {
  return (
    <div className={styles.wrapper}>
      <span className={`${styles.badge} ${styles[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}