import { getState } from "@/lib/blob";

type SeverityCounts = { critical: number; high: number; medium: number; low: number };

type VulnerabilityData = {
  bySeverity: SeverityCounts;
  total: number;
  topPackage: string;
  lastChecked: string;
};

const EMPTY: VulnerabilityData = {
  bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  total: 0,
  topPackage: "—",
  lastChecked: "—",
};

function severityKey(s: string): keyof SeverityCounts {
  const k = s.toLowerCase();
  if (k === "critical") return "critical";
  if (k === "high") return "high";
  if (k === "medium") return "medium";
  return "low";
}

export async function GET(_request: Request) {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) throw new Error("GITHUB_REPOSITORY not configured");

    const token = process.env.GITHUB_PAT;
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/trivy/last-run.json`,
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
    const parsed = JSON.parse(decoded);

    const counts: SeverityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    let total = 0;
    const pkgCounts: Record<string, number> = {};

    for (const result of parsed.Results ?? []) {
      for (const vuln of result.Vulnerabilities ?? []) {
        const sev = severityKey(vuln.Severity ?? "low");
        counts[sev]++;
        total++;
        if (vuln.PkgName) {
          pkgCounts[vuln.PkgName] = (pkgCounts[vuln.PkgName] ?? 0) + 1;
        }
      }
    }

    let topPackage = "—";
    let topCount = 0;
    for (const [pkg, c] of Object.entries(pkgCounts)) {
      if (c > topCount) {
        topCount = c;
        topPackage = pkg;
      }
    }

    return Response.json({
      bySeverity: counts,
      total,
      topPackage,
      lastChecked: new Date().toISOString(),
    });
  } catch {
    const fallback = (await getState<VulnerabilityData>(EMPTY)) ?? EMPTY;
    return Response.json(fallback, { status: 503 });
  }
}
