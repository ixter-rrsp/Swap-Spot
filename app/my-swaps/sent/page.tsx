import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getOutgoingRequests } from "@/lib/services/ServerSwapRequestService";
import MySwapList from "../../components/MySwaps/MySwapList";
import RequestCard from "../../components/SwapRequests/RequestCard/RequestCard";

export default async function SentRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requests = await getOutgoingRequests();
  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <MySwapList
      title="Sent Requests"
      emptyMessage="No sent swap requests yet."
      isEmpty={pendingRequests.length === 0}
    >
      {pendingRequests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          isIncoming={false}
          href={`/swap-requests/${request.id}`}
        />
      ))}
    </MySwapList>
  );
}
