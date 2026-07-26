import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPendingCompletionAgreements } from "@/lib/services/ServerSwapAgreementService";
import MySwapList from "../../components/MySwaps/MySwapList";
import AgreementCard from "../../components/MySwaps/AgreementCard";

export default async function CompleteAgreementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const agreements = await getPendingCompletionAgreements();

  return (
    <MySwapList
      title="To Complete"
      emptyMessage="No swaps waiting for completion."
      isEmpty={agreements.length === 0}
    >
      {agreements.map(agreement => (
        <AgreementCard
          key={agreement.id}
          agreement={agreement}
        />
      ))}
    </MySwapList>
  );
}
