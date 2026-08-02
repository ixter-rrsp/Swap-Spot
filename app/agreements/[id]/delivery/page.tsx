"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import DeliveryAgreementCard from "@/app/components/SwapRequests/DeliveryAgreement/DeliveryAgreementCard";
import styles from "../page.module.css";

export default function DeliveryAgreementPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <main className={styles.container}>Invalid agreement.</main>;
  }

  return (
    <main className={styles.container}>
      <PageHeader
        title="Delivery Agreement"
        subtitle="Manage your courier handoff — no courier account required"
      />

      <DeliveryAgreementCard swapAgreementId={id} />
    </main>
  );
}
