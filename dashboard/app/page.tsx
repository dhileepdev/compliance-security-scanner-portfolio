"use client";

import { useState, useEffect } from "react";
import { getState, setState } from "@/lib/blob";
import ComplianceScore from "@/components/ComplianceScore";
import RuleTable from "@/components/RuleTable";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import TrendChart from "@/components/TrendChart";
import LastUpdated from "@/components/LastUpdated";

type DashboardState = {
  compliance: { score: number; totalRules: number; passedRules: number; failedRules: number; rules: { name: string; status: string; remediation: string }[]; lastChecked: string } | null;
  rules: { name: string; status: string; remediation: string }[];
  vulnerabilities: { bySeverity: { critical: number; high: number; medium: number; low: number }; total: number; topPackage: string; lastChecked: string } | null;
  history: { timestamp: string; score: number; totalRules: number; passedRules: number; failedRules: number }[];
};

const EMPTY: DashboardState = {
  compliance: null,
  rules: [],
  vulnerabilities: null,
  history: [],
};

const POLL_INTERVAL_MS = 30_000;

export default function Page() {
  const [state, setState] = useState<DashboardState>(EMPTY);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [compRes, vulnRes, histRes] = await Promise.allSettled([
          fetch("/api/compliance", { cache: "no-store" }),
          fetch("/api/vulnerabilities", { cache: "no-store" }),
          fetch("/api/history", { cache: "no-store" }),
        ]);

        const compliance =
          compRes.status === "fulfilled" && compRes.value.ok
            ? (await compRes.value.json())
            : null;
        const vulnerabilities =
          vulnRes.status === "fulfilled" && vulnRes.value.ok
            ? (await vulnRes.value.json())
            : null;
        const history =
          histRes.status === "fulfilled" && histRes.value.ok
            ? (await histRes.value.json())
            : null;

        if (!mounted) return;

        const allFailed = compliance === null && vulnerabilities === null;

        if (allFailed) {
          const fallback = await getState<DashboardState>(EMPTY);
          setState(fallback);
          setStale(true);
        } else {
          const newState: DashboardState = {
            compliance: compliance ?? state.compliance,
            rules: compliance?.rules ?? state.rules,
            vulnerabilities: vulnerabilities ?? state.vulnerabilities,
            history: history ?? state.history,
          };
          try {
            await setState(newState);
          } catch {
            // Blob not configured locally
          }
          setState(newState);
          setStale(false);
        }
      } catch {
        if (!mounted) return;
        const fallback = await getState<DashboardState>(EMPTY);
        setState(fallback);
        setStale(true);
      }
    };

    void fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Compliance & Security Scanner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ComplianceScore
          score={state.compliance?.score ?? 0}
          totalRules={state.compliance?.totalRules ?? 0}
          passedRules={state.compliance?.passedRules ?? 0}
          failedRules={state.compliance?.failedRules ?? 0}
          rules={state.compliance?.rules ?? []}
          lastChecked={state.compliance?.lastChecked ?? "—"}
        />
        <div className="md:col-span-2 bg-white p-4 rounded shadow border">
          <RuleTable rules={state.rules} />
        </div>
        <VulnerabilityCard
          bySeverity={state.vulnerabilities?.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 }}
          total={state.vulnerabilities?.total ?? 0}
          topPackage={state.vulnerabilities?.topPackage ?? "—"}
          lastChecked={state.vulnerabilities?.lastChecked ?? "—"}
        />
      </div>
      <div className="bg-white p-4 rounded shadow border">
        <TrendChart history={state.history} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Last checked: {state.compliance?.lastChecked ?? state.vulnerabilities?.lastChecked ?? "—"}
      </p>
      {stale && (
        <p className="text-yellow-600 text-sm mt-2">
          Showing stale state — some APIs unreachable.
        </p>
      )}
    </main>
  );
}
