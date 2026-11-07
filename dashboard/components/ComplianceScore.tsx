type ComplianceData = {
  score: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  rules: { name: string; status: string; remediation: string }[];
  lastChecked: string;
};

export default function ComplianceScore({
  score,
  totalRules,
  passedRules,
  failedRules,
  rules,
  lastChecked,
}: ComplianceData) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-50"
      : score >= 50
        ? "text-yellow-600 bg-yellow-50"
        : "text-red-600 bg-red-50";

  return (
    <div className={`bg-white p-4 rounded shadow border ${color}`}>
      <h2 className="font-semibold mb-2">Compliance Score</h2>
      <p className="text-3xl font-bold">{score}%</p>
      <p className="text-sm text-gray-600">
        {passedRules}/{totalRules} rules passing
      </p>
      <p className="text-xs text-gray-500">{failedRules} failed</p>
    </div>
  );
}
