"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import styles from "./Toast.module.css";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
};

const ToastContext = createContext<(msg: string, type?: Toast["type"], action?: Toast["action"]) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "success", action?: Toast["action"]) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    const t: Toast = { id, message, type, action };
    setToasts((s) => [t, ...s]);
    window.setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  // listen for window-level toast events for compatibility
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom?.detail;
      if (detail?.message) {
        show(detail.message, detail.type ?? "success", detail.action);
      }
    };

    window.addEventListener("swapspot:toast", handler as EventListener);
    return () => window.removeEventListener("swapspot:toast", handler as EventListener);
  }, [show]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.toastContainer} data-nextjs-toast role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.type ?? ""}`}>
            <span>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className={styles.toastAction}
                onClick={() => {
                  t.action?.onClick?.();
                  setToasts((s) => s.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
