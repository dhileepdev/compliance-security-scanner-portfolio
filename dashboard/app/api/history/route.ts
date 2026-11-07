import { getState } from "@/lib/blob";

type HistoryEntry = {
  timestamp: string;
  score: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
};

type HistoryData = HistoryEntry[];

const EMPTY: HistoryData = [];

export async function GET(_request: Request) {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) throw new Error("GITHUB_REPOSITORY not configured");

    const token = process.env.GITHUB_PAT;
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/compliance/history.jsonl`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
          : { Accept: "application/vnd.github+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const data = await res.json();
    const contentBase64 = data.content as string;
    if (!contentBase64) throw new Error("no content field");

    const decoded = Buffer.from(contentBase64, "base64").toString("utf-8");
    const entries: HistoryEntry[] = decoded
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .slice(-50);

    return Response.json(entries);
  } catch {
    const fallback = (await getState<HistoryData>(EMPTY)) ?? EMPTY;
    return Response.json(fallback, { status: 503 });
  }
}
