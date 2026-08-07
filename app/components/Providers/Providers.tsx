"use client";

import React from "react";
import ToastProvider from "@/app/components/UI/Toast/ToastContext";
import SavedListingsProvider from "@/app/components/Providers/SavedListingsContext";
import GuestModeProvider from "@/app/components/Providers/GuestModeContext";
import usePresenceHeartbeat from "@/lib/hooks/usePresenceHeartbeat";
import useSuspensionWatcher from "@/lib/hooks/useSuspensionWatcher";

function SuspensionWatcher() {
  useSuspensionWatcher();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  usePresenceHeartbeat();

  return (
    <ToastProvider>
      <SuspensionWatcher />
      <GuestModeProvider>
        <SavedListingsProvider>{children}</SavedListingsProvider>
      </GuestModeProvider>
    </ToastProvider>
  );
}
