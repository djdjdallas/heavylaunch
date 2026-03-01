"use client";

import { ToastProvider } from "@/components/ui/toast";

export function ToastProviderWrapper({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
