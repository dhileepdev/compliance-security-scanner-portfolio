"use client";

import VulnerabilityCard from "@/components/VulnerabilityCard";
import { useDashboardData } from "@/lib/useDashboardData";

export default function VulnerabilitiesPage() {
  const { state, stale, fresh, refresh } = useDashboardData();

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Vulnerabilities</h1>
          <p className="title-sub">Open security vulnerabilities detected across scanned dependencies.</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => void refresh()}>
            Refresh
          </button>
          <span className="stamp">Updated {fresh ?? "—"}</span>
          {stale && <span className="stamp">Stale</span>}
        </div>
      </div>

      <section id="vulnerabilities" className="section">
        <VulnerabilityCard
          bySeverity={state.bySeverity}
          total={state.total}
          topPackage={state.topPackage}
          lastChecked={state.lastChecked}
        />
      </section>
    </div>
  );
}
