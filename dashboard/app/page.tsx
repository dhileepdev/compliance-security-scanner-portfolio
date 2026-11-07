"use client";

import { useState, useEffect, useRef } from "react";
import { getState, setState } from "@/lib/blob";
import RuleTable from "@/components/RuleTable";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import TrendChart from "@/components/TrendChart";

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
  const [fresh, setFresh] = useState<string | null>(null);
  const runFetch = useRef<(() => void) | undefined>(undefined);

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
        setFresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

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
    runFetch.current = fetchAll;
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const c = state.compliance;
  const v = state.vulnerabilities;
  const score = c?.score ?? 0;
  const passed = c?.passedRules ?? 0;
  const failed = c?.failedRules ?? 0;
  const totalRules = c?.totalRules ?? 0;
  const vulnTotal = v?.total ?? 0;

  return (
    <div className="space-y-[24px]">
      {/* Title row */}
      <div className="section-head">
        <div>
          <h1 className="text-[#131416]">Compliance &amp; Security Scanner</h1>
          <p className="muted text-[12px] mt-1">
            Kyverno CEL policies &bull; Trivy scanning &bull; GitHub Actions CI/CD
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" onClick={() => runFetch.current?.()}>
            Refresh
          </button>
          <span className="muted text-[12px]">Updated {fresh ?? "—"}</span>
        </div>
      </div>

      {/* KPI strip — score is the answer figure, leads */}
      <div className="kpi-strip">
        <div className="kpi-cell col-span-1">
          <span className="kpi-label">Compliance score</span>
          <span className="kpi-value">{score}%</span>
          <span className="kpi-unit">of {totalRules} rules</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Rules passing</span>
          <span className="kpi-value">{passed}</span>
          <span className="kpi-unit">of {totalRules}</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Rules failing</span>
          <span className={`kpi-value ${failed > 0 ? "text-[#c4242a]" : "text-[#131416]"}`}>{failed}</span>
          <span className="kpi-unit">{failed > 0 ? "needs fix" : "clean"}</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Vulnerabilities</span>
          <span className="kpi-value">{vulnTotal}</span>
          <span className="kpi-unit">by severity</span>
        </div>
      </div>

      {/* Rules */}
      <div className="section">
        <div className="section-head">
          <span className="section-title">Rules</span>
          <button className="btn">View all</button>
        </div>
        <div className="flat-card">
          <RuleTable rules={c?.rules ?? []} />
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="section">
        <div className="section-head">
          <span className="section-title">Vulnerabilities</span>
          <button className="btn">View all</button>
        </div>
        <div className="flat-card">
          <VulnerabilityCard
            bySeverity={v?.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 }}
            total={vulnTotal}
            topPackage={v?.topPackage ?? "—"}
            lastChecked={v?.lastChecked ?? "—"}
          />
        </div>
      </div>

      {/* Trend */}
      <div className="section">
        <div className="section-head">
          <span className="section-title">Compliance trend</span>
          <button className="btn">View all</button>
        </div>
        <div className="flat-card">
          <TrendChart history={state.history} />
        </div>
      </div>

      {stale && (
        <div className="section">
          <div className="flat-card" style={{ padding: "12px 24px" }}>
            <span className="dot dot-warn"></span>
            <span className="muted text-[12px]">Showing stale state — some APIs unreachable.</span>
          </div>
        </div>
      )}
    </div>
  );
}
