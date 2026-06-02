"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getClientPollMs } from "@/lib/data-cache";
import {
  DataRefreshContext,
  type DataRefreshContextValue,
} from "@/components/providers/data-refresh-context";

const MIN_REFRESH_GAP_MS = 4_000;

interface DataRefreshProviderProps {
  children: ReactNode;
}

export function DataRefreshProvider({ children }: DataRefreshProviderProps) {
  const router = useRouter();
  const lastRefreshAt = useRef(0);
  const refreshing = useRef(false);

  const refreshNow = useCallback(() => {
    const now = Date.now();
    if (
      refreshing.current ||
      now - lastRefreshAt.current < MIN_REFRESH_GAP_MS
    ) {
      return;
    }

    refreshing.current = true;
    lastRefreshAt.current = now;

    void fetch("/api/revalidate", { method: "POST" })
      .catch(() => {
        /* Si falla, igual intentamos refrescar la UI */
      })
      .finally(() => {
        router.refresh();
        window.dispatchEvent(new CustomEvent("finanzas:data-refresh"));
        refreshing.current = false;
      });
  }, [router]);

  useEffect(() => {
    const pollMs = getClientPollMs();

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    }, pollMs);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [refreshNow]);

  const value: DataRefreshContextValue = { refreshNow };

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export { useDataRefresh } from "@/components/providers/data-refresh-context";
