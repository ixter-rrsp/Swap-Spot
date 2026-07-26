"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import { createMyDeliveryBooking } from "@/lib/actions/DeliveryActions";

interface Props {
  agreementId: string;
}

interface QuoteOption {
  id?: string;
  quotationId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  [key: string]: any;
}

export default function ActionsClient({ agreementId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteOption[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const u = data?.user;
        if (mounted) setUserId(u?.id ?? null);
      } catch (e) {
        console.error("Failed to get user:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function requestQuote() {
    if (!userId) {
      toast("Please sign in to request a quote", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/lalamove/quotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: `agreement-${agreementId}`,
          user_id: userId,
        }),
      });
      const json = await res.json();
      setResult(json);
      const quotePayload = json?.quotation;
      const options = Array.isArray(quotePayload) ? quotePayload : quotePayload ? [quotePayload] : [];
      setQuotes(options);
      if (options.length > 0) {
        const firstId = options[0].id ?? options[0].quotationId ?? null;
        setSelectedQuoteId(firstId);
      }
      if (json?.ok) toast("Quotation received", "success");
      else toast(json?.error ?? "Quotation failed", "error");
    } catch (e) {
      console.error(e);
      setResult({ error: (e as Error).message });
      setQuotes([]);
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function placeOrder() {
    if (!userId) {
      toast("Please sign in to place an order", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/lalamove/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreement_id: agreementId,
          user_id: userId,
          quotation_id: selectedQuoteId,
        }),
      });
      const json = await res.json();
      setResult(json);
      if (json?.ok) toast("Order placed", "success");
      else toast(json?.error ?? "Order failed", "error");
    } catch (e) {
      console.error(e);
      setResult({ error: (e as Error).message });
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function bookMyDelivery() {
    if (!userId) {
      toast("Please sign in to book delivery", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createMyDeliveryBooking(agreementId);
      if (result.ok) {
        toast(result.alreadyExists ? "You already have a delivery booking" : "Your delivery booking is ready", "success");
      }
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={bookMyDelivery} disabled={loading}>
          {loading ? "Working..." : "Book my delivery"}
        </button>
        <button onClick={requestQuote} disabled={loading}>
          {loading ? "Working..." : "Request Quote"}
        </button>
        <button onClick={placeOrder} disabled={loading || !selectedQuoteId}>
          {loading ? "Working..." : "Place Order"}
        </button>
      </div>

      {quotes.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {quotes.map((quote, index) => {
            const quoteId = quote.id ?? quote.quotationId ?? `${index}`;
            const isSelected = quoteId === selectedQuoteId;
            return (
              <button
                key={quoteId}
                type="button"
                onClick={() => setSelectedQuoteId(quoteId)}
                style={{
                  border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
                  borderRadius: 10,
                  background: isSelected ? "#eff6ff" : "#fff",
                  padding: 12,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600 }}>Quote {index + 1}</div>
                <div style={{ color: "#4b5563", marginTop: 4 }}>{quote.status ?? "Available"}</div>
                <div style={{ color: "#111827", marginTop: 4 }}>
                  {quote.amount != null ? `${quote.amount} ${quote.currency ?? "USD"}` : "Price pending"}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {result ? <pre style={{ marginTop: 8 }}>{JSON.stringify(result, null, 2)}</pre> : null}
    </div>
  );
}
