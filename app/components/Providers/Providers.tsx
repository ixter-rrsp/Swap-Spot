"use client";

import React from "react";
import ToastProvider from "@/app/components/UI/Toast/ToastContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
