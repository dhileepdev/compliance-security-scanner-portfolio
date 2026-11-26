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

// Support config priority: UI localStorage > env vars > GitHub default

export async function GET(_request: Request) {
  try {
    // 1. Try UI-configured API (set from dashboard Settings section)
    const uiApi = (global as any)?.HISTORY_API;
    if (uiApi) {
      const res = await fetch(uiApi, {
        cache: "no-store",
      });
      if (res.ok) {
        const d = await res.json();
        return Response.json(d);
      }
      // Fall through to GitHub if UI API fails
    }

    // 2. Try env var configured API
    const envApi = process.env.HISTORY_API;
    if (envApi) {
      const res = await fetch(envApi, {
        cache: "no-store",
      });
      if (res.ok) {
        const d = await res.json();
        return Response.json(d);
      }
      // Fall through to GitHub if env API fails
    }

    // 3. Fall back to GitHub
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) throw new Error("GITHUB_REPOSITORY not configured and no API set");

    const token = process.env.GITHUB_PAT
      ? `Bearer ${process.env.GITHUB_PAT}`
      : "";

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/compliance/history.jsonl`,
      {
        headers: new Headers({
          "Authorization": token,
          "Accept": "application/vnd.github+json",
        }),
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