type HistoryEntry = { timestamp: string; score: number };

export default function TrendChart({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 pt-10">
        <p className="muted text-[12px]">No trend data available yet</p>
      </div>
    );
  }

  const scores = history.map((h) => h.score);
  const maxScore = Math.max(...scores, 100);
  const barHeight = (score: number) => Math.max(12, (score / maxScore) * 100);

  return (
    <div className="space-y-3">
      <div className="h-36 flex items-end gap-2">
        {scores.map((score, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end w-full"
            style={{ height: `${barHeight(score)}%` }}
          >
            <div
              className="w-full bg-[#1b6c80] rounded-t-[6px]"
              style={{ height: `${barHeight(score)}%` }}
            />
            <span className="text-[10px] text-[#5d5f60] mt-1 num">{score}</span>
          </div>
        ))}
      </div>
      <p className="muted text-[12px]">Last {history.length} runs &bull; compliance score</p>
    </div>
  );
}
