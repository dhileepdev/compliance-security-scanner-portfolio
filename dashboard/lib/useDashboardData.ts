"use client";

import { useEffect, useRef, useState } from "react";

export type DashboardState = {
  score: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  rules: { name: string; status: string; remediation: string }[];
  bySeverity: { critical: number; high: number; medium: number; low: number };
  total: number;
  topPackage: string;
  lastChecked: string;
  lastPolled: string | null;
};

export const EMPTY_DASHBOARD: DashboardState = {
  score: 0,
  totalRules: 0,
  passedRules: 0,
  failedRules: 0,
  rules: [],
  bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  total: 0,
  topPackage: "—",
  lastChecked: "—",
  lastPolled: null,
};

/**
 * Shared dashboard data source: fetches compliance/vulnerability/history
 * APIs with priority UI > env vars > history > fallback, and polls.
 */
export function useDashboardData(intervalMs = 30_000) {
  const [state, setState] = useState<DashboardState>(EMPTY_DASHBOARD);
  const [stale, setStale] = useState(true);
  const [fresh, setFresh] = useState<string | null>(null);
  const runFetch = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Show initial state immediately (client-only, avoids hydration mismatch)
    setState(EMPTY_DASHBOARD);
    setStale(true);

    const fetchAll = async () => {
      try {
        // Gather data from all API routes with config priority
        // 1. Try UI-configured API (from SettingsPanel localStorage)
        const uiApi = (global as any)?.COMPLIANCE_API;
        let uiData: DashboardState | null = null;

        if (uiApi) {
          const res = await fetch(uiApi, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            uiData = {
              score: data.score ?? 0,
              totalRules: data.totalRules ?? 0,
              passedRules: data.passedRules ?? 0,
              failedRules: data.failedRules ?? 0,
              rules: data.rules ?? [],
              bySeverity: data.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 },
              total: data.total ?? 0,
              topPackage: data.topPackage ?? "—",
              lastChecked: data.lastChecked ?? "—",
              lastPolled: new Date().toISOString(),
            };
          }
        }

        // 2. Try env var configured API
        const envApi = process.env.COMPLIANCE_API;
        let envData: DashboardState | null = null;

        if (envApi && !uiData) {
          const res = await fetch(envApi, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            envData = {
              score: data.score ?? 0,
              totalRules: data.totalRules ?? 0,
              passedRules: data.passedRules ?? 0,
              failedRules: data.failedRules ?? 0,
              rules: data.rules ?? [],
              bySeverity: data.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 },
              total: data.total ?? 0,
              topPackage: data.topPackage ?? "—",
              lastChecked: data.lastChecked ?? "—",
              lastPolled: new Date().toISOString(),
            };
          }
        }

        // 3. Try history API
        const historyApi = process.env.HISTORY_API;
        let historyData: DashboardState | null = null;

        if (historyApi && !uiData && !envData) {
          const res = await fetch(historyApi, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json() as DashboardState[];
            if (data.length > 0) {
              const latest = data[data.length - 1];
              historyData = {
                score: latest.score ?? 0,
                totalRules: latest.totalRules ?? 0,
                passedRules: latest.passedRules ?? 0,
                failedRules: latest.failedRules ?? 0,
                rules: latest.rules ?? [],
                bySeverity: latest.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 },
                total: latest.total ?? 0,
                topPackage: latest.topPackage ?? "—",
                lastChecked: latest.lastChecked ?? "—",
                lastPolled: new Date().toISOString(),
              };
            }
          }
        }

        // Use priority: UI > env vars > history > fallback
        let data: DashboardState;

        if (uiData) {
          data = uiData;
          setStale(false);
        } else if (envData) {
          data = envData;
          setStale(false);
        } else if (historyData) {
          data = historyData;
          setStale(false);
        } else {
          // Fallback to empty state
          data = EMPTY_DASHBOARD;
          setStale(true);
        }

        setState(data);
        setFresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // Fallback on error
        setState(EMPTY_DASHBOARD);
        setStale(true);
      }
    };

    void fetchAll();
    runFetch.current = fetchAll;
    const interval = setInterval(fetchAll, intervalMs);
    return () => {
      clearInterval(interval);
    };
  }, [intervalMs]);

  const refresh = () => {
    void runFetch.current?.();
  };

  return { state, stale, fresh, refresh };
}
