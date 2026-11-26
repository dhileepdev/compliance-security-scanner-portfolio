import { getState } from "@/lib/blob";

type ComplianceData = {
  score: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  rules: { name: string; status: string; remediation: string }[];
  lastChecked: string;
};

const EMPTY: ComplianceData = {
  score: 0,
  totalRules: 0,
  passedRules: 0,
  failedRules: 0,
  rules: [],
  lastChecked: "—",
};

// Support config priority: UI localStorage > env vars > GitHub default

export async function GET(_request: Request) {
  try {
    // 1. Try UI-configured API (set from dashboard Settings section)
    const uiApi = (global as any)?.COMPLIANCE_API;
    if (uiApi) {
      const res = await fetch(uiApi, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json({
          score: data.score ?? 0,
          totalRules: data.totalRules ?? 0,
          passedRules: data.passedRules ?? 0,
          failedRules: data.failedRules ?? 0,
          rules: data.rules ?? [],
          lastChecked: data.lastChecked ?? "—",
        });
      }
      // Fall through to GitHub if UI API fails
    }

    // 2. Try env var configured API
    const envApi = process.env.COMPLIANCE_API;
    if (envApi) {
      const res = await fetch(envApi, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json({
          score: data.score ?? 0,
          totalRules: data.totalRules ?? 0,
          passedRules: data.passedRules ?? 0,
          failedRules: data.failedRules ?? 0,
          rules: data.rules ?? [],
          lastChecked: data.lastChecked ?? "—",
        });
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
      `https://api.github.com/repos/${repo}/contents/compliance/last-run.json`,
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
    const parsed = JSON.parse(decoded);

    return Response.json({
      score: parsed.score ?? 0,
      totalRules: parsed.totalRules ?? 0,
      passedRules: parsed.passedRules ?? 0,
      failedRules: parsed.failedRules ?? 0,
      rules: parsed.rules ?? [],
      lastChecked: parsed.lastChecked ?? "—",
    });
  } catch {
    const fallback = (await getState<ComplianceData>(EMPTY)) ?? EMPTY;
    return Response.json(fallback, { status: 503 });
  }
}