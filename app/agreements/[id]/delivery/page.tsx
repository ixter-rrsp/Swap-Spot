import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import createServiceClient from "@/utils/supabase/service";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import ActionsClient from "./ActionsClient";

type BookingRecord = {
  id: string;
  agreement_id?: string | null;
  user_id?: string | null;
  provider_key?: string | null;
  order_id?: string | null;
  status?: string | null;
  normalized_status?: string | null;
  payload?: Record<string, unknown> | string | null;
  response?: Record<string, unknown> | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

function formatTimestamp(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getBookingStatus(booking: BookingRecord) {
  const responseStatus =
    typeof booking.response === "object" && booking.response && "status" in booking.response
      ? booking.response.status
      : null;

  return (
    booking.normalized_status ??
    booking.status ??
    (typeof responseStatus === "string" ? responseStatus : "pending")
  );
}

function getBookingDetails(booking: BookingRecord) {
  const payload =
    typeof booking.payload === "object" && booking.payload
      ? (booking.payload as Record<string, unknown>)
      : null;
  const response =
    typeof booking.response === "object" && booking.response
      ? (booking.response as Record<string, unknown>)
      : null;

  const details: Array<[string, string]> = [
    ["Owner", booking.user_id ? String(booking.user_id) : "—"],
    ["Provider", booking.provider_key ? String(booking.provider_key) : "—"],
    ["Status", String(getBookingStatus(booking) ?? "pending")],
    [
      "Order ID",
      booking.order_id
        ? String(booking.order_id)
        : response?.orderId || response?.id
          ? String(response?.orderId ?? response?.id)
          : "—",
    ],
    ["Created", formatTimestamp(booking.created_at ?? null)],
  ];

  const extraDetails: Array<[string, string]> = [];
  const pickup =
    (payload?.pickup_address as string | undefined) ??
    (payload?.pickup as Record<string, unknown> | undefined)?.address ??
    (response?.pickup_address as string | undefined) ??
    (response?.pickup as Record<string, unknown> | undefined)?.address;
  const dropoff =
    (payload?.dropoff_address as string | undefined) ??
    (payload?.dropoff as Record<string, unknown> | undefined)?.address ??
    (response?.dropoff_address as string | undefined) ??
    (response?.dropoff as Record<string, unknown> | undefined)?.address;
  const quote =
    (payload?.quotation_id as string | undefined) ??
    (response?.quotation_id as string | undefined) ??
    (response?.quotationId as string | undefined);
  const note =
    (payload?.note as string | undefined) ??
    (response?.note as string | undefined) ??
    (response?.message as string | undefined);

  if (pickup) extraDetails.push(["Pickup", String(pickup)]);
  if (dropoff) extraDetails.push(["Drop-off", String(dropoff)]);
  if (quote) extraDetails.push(["Quote", String(quote)]);
  if (note) extraDetails.push(["Note", String(note)]);

  return { details, extraDetails };
}

export default async function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agreementId = typeof id === "string" && id.trim() ? id.trim() : null;

  const authClient = await createClient();
  const { data: authData, error: authError } = await authClient.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  let bookings: BookingRecord[] | null = null;
  let error: { message: string } | null = null;

  if (!agreementId) {
    error = { message: "Invalid agreement id." };
  } else {
    try {
      const serviceSupabase = createServiceClient();
      const supabase = serviceSupabase ?? authClient;
      const response = await supabase
        .from("delivery_bookings")
        .select("*")
        .eq("agreement_id", agreementId)
        .order("created_at", { ascending: false });

      bookings = (response.data as BookingRecord[] | null) ?? null;
      error = response.error ? { message: response.error.message } : null;
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : "Unable to load bookings.";
      error = { message };
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 880, margin: "0 auto" }}>
      <PageHeader
        title="Delivery"
        subtitle="Track courier quotes and booking state for this swap agreement."
        showBack
      />

      {error ? <div style={{ color: "red", marginTop: 12 }}>Error loading bookings: {error.message}</div> : null}

      <section style={{ marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Current bookings</h2>
        {bookings && bookings.length > 0 ? (
          <ul style={{ paddingLeft: 18, display: "grid", gap: 10 }}>
            {(bookings as BookingRecord[]).map((booking) => {
              const { details, extraDetails } = getBookingDetails(booking);
              return (
                <li key={booking.id} style={{ background: "#f9fafb", padding: 12, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{booking.provider_key ?? "Provider"}</strong>
                    <span style={{ color: "#4b5563" }}>
                      {booking.order_id ? String(booking.order_id) : "No order yet"}
                    </span>
                  </div>

                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    {details.map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ color: "#6b7280" }}>{label}</span>
                        <span style={{ color: "#111827", textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {extraDetails.length > 0 ? (
                    <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                      {extraDetails.map(([label, value]) => (
                        <div key={label} style={{ color: "#4b5563", wordBreak: "break-word" }}>
                          <strong>{label}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>No bookings yet. Use the actions below to request a quote or place an order.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Courier actions</h2>
        <ActionsClient agreementId={agreementId ?? ""} />
      </section>
    </main>
  );
}
