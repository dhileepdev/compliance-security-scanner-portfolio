"use client";

import RuleTable from "@/components/RuleTable";
import { useDashboardData } from "@/lib/useDashboardData";

export default function RulesPage() {
  const { state, stale, fresh, refresh } = useDashboardData();

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Rules</h1>
          <p className="title-sub">Compliance rules evaluated by the scanner and their remediation status.</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => void refresh()}>
            Refresh
          </button>
          <span className="stamp">Updated {fresh ?? "—"}</span>
          {stale && <span className="stamp">Stale</span>}
        </div>
      </div>

      <section id="rules" className="section">
        <RuleTable rules={state.rules} />
      </section>
    </div>
  );
}
