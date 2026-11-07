type Rule = { name: string; status: string; remediation: string };

export default function RuleTable({ rules }: { rules: Rule[] }) {
  if (rules.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="muted text-[12px]">No rule data available</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th className="pb-3">Rule</th>
            <th className="pb-3 num pr-4">Status</th>
            <th className="pb-3">Remediation</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.name} className="rule-row">
              <td className="rule-name">{rule.name}</td>
              <td className={`rule-status ${rule.status === "fail" ? "text-[#c4242a]" : "text-[#1e7b4f]"}`}>
                {rule.status}
              </td>
              <td className="rule-rem">{rule.remediation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
