"use client";

import { useEffect, useRef } from "react";

// Accessible responsive table:
// - Semantic <table> with <caption>
// - Wrapper with tabindex="0" role="region" aria-labelledby
// - container-type: inline-size for @container queries
// - Sticky thead/th for desktop
// - @container (width < 600px) stacked layout with ::before labels from CSS vars
// - Keeps table semantics intact (no display: block on table elements)
// - data-label attributes for CSS ::before injection in stacked mode
type Rule = { name: string; status: string; remediation: string };

export default function RuleTable({ rules }: { rules: Rule[] }) {
  if (rules.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-title">No rule data available</div>
          <div className="empty-copy">
            No rules have been scanned yet. Run a compliance scan to populate the table.
          </div>
          <button className="btn btn-primary">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="table-wrapper" tabIndex={0} role="region" aria-labelledby="rules-table">
        <table id="rules-table">
          <caption>Compliance Rules</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky">Rule</th>
              <th scope="col" className="sticky">Status</th>
              <th scope="col" className="sticky">Remediation</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <tr key={i}>
                <td data-label="Rule" className="sticky">
                  {rule.name}
                </td>
                <td data-label="Status" className="sticky">
                  {rule.status}
                </td>
                <td data-label="Remediation" className="sticky">
                  {rule.remediation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}