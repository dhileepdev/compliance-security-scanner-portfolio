"use client";

import TrendChart from "@/components/TrendChart";
import { useDashboardData } from "@/lib/useDashboardData";

export default function TrendPage() {
  const { state, stale, fresh, refresh } = useDashboardData();

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Trend</h1>
          <p className="title-sub">Compliance score trend over time.</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => void refresh()}>
            Refresh
          </button>
          <span className="stamp">Updated {fresh ?? "—"}</span>
          {stale && <span className="stamp">Stale</span>}
        </div>
      </div>

      <section id="trend" className="section">
        <TrendChart />
      </section>
    </div>
  );
}
