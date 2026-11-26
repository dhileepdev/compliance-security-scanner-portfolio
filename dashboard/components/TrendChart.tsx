"use client";

import React from "react";

type TrendPoint = { timestamp: string; score: number };

const W = 300;
const H = 200;
const PAD_X = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 16;

function Sparkline({ points }: { points: TrendPoint[] }) {
  const minScore = 0;
  const maxScore = 100;
  const scoreRange = maxScore - minScore || 1;

  const ys = points.map(
    (p) => H - PAD_BOTTOM - ((p.score - minScore) / scoreRange) * (H - PAD_TOP - PAD_BOTTOM)
  );
  const xs = points.map((_, i) =>
    PAD_X + (points.length > 1 ? (i * (W - PAD_X * 2)) / (points.length - 1) : (W - PAD_X * 2) / 2)
  );

  const linePoints =
    points.length > 1
      ? points.map((_, i) => `${xs[i]} ${ys[i]}`).join(" ")
      : "";

  const lastX = points.length > 1 ? xs[points.length - 1] : xs[0];
  const lastY = ys[points.length - 1];

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-label="Compliance trend over time"
      role="img"
      preserveAspectRatio="none"
    >
      <title>Compliance trend over time</title>
      <desc>Shows compliance score trend with a sparkline</desc>
      {points.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          style={{ stroke: "var(--accent)" }}
          strokeWidth={2}
        />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r={3} style={{ fill: "var(--accent)" }} />
      ))}
      {points.length > 0 && (
        <circle cx={lastX} cy={lastY} r={4} style={{ fill: "var(--accent)" }} />
      )}
    </svg>
  );
}

export default function TrendChart() {
  const [points, setPoints] = React.useState<TrendPoint[]>([
    { timestamp: "00:00", score: 50 },
    { timestamp: "06:00", score: 65 },
    { timestamp: "12:00", score: 75 },
    { timestamp: "18:00", score: 60 },
    { timestamp: "23:59", score: 80 },
  ]);

  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="section-title">Compliance Trend</h3>
      </div>
      {points.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No trend data</div>
          <div className="empty-copy">
            Run a compliance scan to populate the trend chart.
          </div>
        </div>
      ) : (
        <div className="trend-card">
          <Sparkline points={points} />
        </div>
      )}
    </div>
  );
}
