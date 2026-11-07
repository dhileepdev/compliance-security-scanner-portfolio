type HistoryEntry = {
  timestamp: string;
  score: number;
};

export default function TrendChart({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="font-semibold mb-2">Compliance Trend</h2>
        <p className="text-sm text-gray-500">No trend data available yet</p>
      </div>
    );
  }

  const scores = history.map((h) => h.score);
  const maxScore = Math.max(...scores, 100);
  const barHeight = (score: number) => Math.max(10, (score / maxScore) * 100);

  return (
    <div className="bg-white p-4 rounded shadow border">
      <h2 className="font-semibold mb-2">Compliance Trend</h2>
      <div className="h-32 flex items-end gap-1">
        {scores.map((score, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end w-full"
            style={{ height: `${barHeight(score)}%` }}
          >
            <div className="w-full bg-blue-600 rounded-t" />
            <span className="text-[10px] text-gray-500 mt-1">{score}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Last {history.length} runs
      </p>
    </div>
  );
}
