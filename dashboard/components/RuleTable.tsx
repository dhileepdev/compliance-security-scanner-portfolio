type Rule = { name: string; status: string; remediation: string };

export default function RuleTable({ rules }: { rules: Rule[] }) {
  return (
    <div className="bg-white p-4 rounded shadow border">
      <h2 className="font-semibold mb-2">Rules</h2>
      {rules.length === 0 ? (
        <p className="text-sm text-gray-500">No rule data available</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-2">Rule</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-left pb-2">Remediation</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.name}>
                <td className="py-1">{rule.name}</td>
                <td className={`py-1 ${
                  rule.status === "fail" ? "text-red-600" : "text-green-600"
                }`}>
                  {rule.status}
                </td>
                <td className="py-1 text-gray-500">{rule.remediation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
