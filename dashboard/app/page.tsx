"use client";

import RuleTable from "@/components/RuleTable";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import TrendChart from "@/components/TrendChart";
import { useDashboardData } from "@/lib/useDashboardData";

export default function Page() {
  const { state, stale, fresh, refresh } = useDashboardData();

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Compliance & Security Scanner</h1>
          <p className="title-sub">Compliance posture across scanned rules and open vulnerabilities.</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => void refresh()}>
            Refresh
          </button>
          <span className="stamp">Updated {fresh ?? "—"}</span>
          {stale && <span className="stamp">Stale</span>}
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell">
          <h2 className="kpi-label">Compliance Score</h2>
          <div className="kpi-value lead">{state.score}</div>
          <div className="kpi-sub">{state.passedRules} of {state.totalRules} rules passing</div>
        </div>
        <div className="kpi-cell">
          <h2 className="kpi-label">Rules</h2>
          <div className="kpi-value">{state.passedRules + state.failedRules}</div>
          <div className="kpi-sub">{state.failedRules} failing</div>
        </div>
        <div className="kpi-cell">
          <h2 className="kpi-label">Vulnerabilities</h2>
          <div className="kpi-value">{state.total}</div>
          <div className="kpi-sub">
            {state.bySeverity.critical} critical · {state.bySeverity.high} high
          </div>
        </div>
      </div>

      <section id="rules" className="section">
        <div className="section-head">
          <span className="section-title">Rules</span>
        </div>
        <RuleTable rules={state.rules} />
      </section>

      <section id="vulnerabilities" className="section">
        <div className="section-head">
          <span className="section-title">Vulnerabilities</span>
        </div>
        <VulnerabilityCard
          bySeverity={state.bySeverity}
          total={state.total}
          topPackage={state.topPackage}
          lastChecked={state.lastChecked}
        />
      </section>

      <section id="trend" className="section">
        <div className="section-head">
          <span className="section-title">Trend</span>
        </div>
        <TrendChart />
      </section>
    </div>
  );
}
