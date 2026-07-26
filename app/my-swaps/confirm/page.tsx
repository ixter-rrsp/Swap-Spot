import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPendingConfirmationAgreements } from "@/lib/services/ServerSwapAgreementService";
import MySwapList from "../../components/MySwaps/MySwapList";
import AgreementCard from "../../components/MySwaps/AgreementCard";

export default async function ConfirmAgreementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const agreements = await getPendingConfirmationAgreements();

  return (
    <MySwapList
      title="To Confirm"
      emptyMessage="No agreements waiting for confirmation."
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
