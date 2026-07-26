import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getIncomingRequests } from "@/lib/services/ServerSwapRequestService";
import MySwapList from "../../components/MySwaps/MySwapList";
import RequestCard from "../../components/SwapRequests/RequestCard/RequestCard";

export default async function AcceptRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requests = await getIncomingRequests();
  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <MySwapList
      title="To Accept"
      emptyMessage="No incoming requests."
      isEmpty={pendingRequests.length === 0}
    >
      {pendingRequests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          isIncoming={true}
          hideActions={true}
          href={`/swap-requests/${request.id}`}
        />
      ))}
    </MySwapList>
  );
}
