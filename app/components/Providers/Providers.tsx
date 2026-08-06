"use client";

import React from "react";
import ToastProvider from "@/app/components/UI/Toast/ToastContext";
import SavedListingsProvider from "@/app/components/Providers/SavedListingsContext";
import GuestModeProvider from "@/app/components/Providers/GuestModeContext";
import usePresenceHeartbeat from "@/lib/hooks/usePresenceHeartbeat";

export default function Providers({ children }: { children: React.ReactNode }) {
  usePresenceHeartbeat();

  return (
    <ToastProvider>
      <GuestModeProvider>
        <SavedListingsProvider>{children}</SavedListingsProvider>
      </GuestModeProvider>
    </ToastProvider>
  );
}
