import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCompletedAgreements } from "@/lib/services/ServerSwapAgreementService";
import { getAgreementReviewStatus } from "@/lib/services/ServerReviewService";
import MySwapList from "../../components/MySwaps/MySwapList";
import AgreementCard from "../../components/MySwaps/AgreementCard";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const agreements = await getCompletedAgreements();

  // Fetch review status for all agreements in parallel
  const reviewStatuses = await Promise.all(
    agreements.map((a) => getAgreementReviewStatus(a.id))
  );

  return (
    <MySwapList
      title="History"
      emptyMessage="No completed swaps yet."
      isEmpty={agreements.length === 0}
    >
      {agreements.map((agreement, i) => (
        <AgreementCard
          key={agreement.id}
          agreement={agreement}
          reviewStatus={reviewStatuses[i]}
        />
      ))}
    </MySwapList>
  );
}

