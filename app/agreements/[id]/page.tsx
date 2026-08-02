"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import AgreementStatus from "@/app/components/SwapRequests/AgreementStatus/AgreementStatus";
import AgreementDeliveryDetails from "@/app/components/SwapRequests/AgreementDeliveryDetails/AgreementDeliveryDetails";
import DeliveryAgreementCard from "@/app/components/SwapRequests/DeliveryAgreement/DeliveryAgreementCard";
import AgreementActions from "@/app/components/SwapRequests/AgreementActions/AgreementActions";
import { SwapAgreementDetail } from "@/lib/types/SwapAgreementDetail";
import styles from "./page.module.css";

export default function AgreementPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [agreement, setAgreement] = useState<SwapAgreementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/swap-agreements/${id}`);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to load agreement.");
      }

      const data: SwapAgreementDetail = await response.json();
      setAgreement(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load agreement.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <main className={styles.container}>Loading agreement...</main>;
  }

  if (error || !agreement) {
    return (
      <main className={styles.container}>
        {error || "Agreement not found."}
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <PageHeader title="Swap Agreement" subtitle="Review the handoff details" />

      <div className={styles.card}>
        <AgreementStatus status={agreement.status} />
        <AgreementDeliveryDetails agreement={agreement} />
      </div>

      {agreement.deliveryMethod === "other_courier" && (
        <DeliveryAgreementCard swapAgreementId={id!} />
      )}

      <AgreementActions agreement={agreement} />
    </main>
  );
}
