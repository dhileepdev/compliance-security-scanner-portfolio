/// <reference types="vitest/globals" />
import { GET } from "./route";

const mockRequest = new Request("http://localhost/api/vulnerabilities");

const mockFetch = vi.spyOn(globalThis, "fetch");

const GITHUB_CONTENT_API =
  "https://api.github.com/repos/owner/repo/contents/trivy/last-run.json";
const BLOB_URL = "https://public.blob.vercel-storage.com/dashboard-state.json";

beforeEach(() => {
  process.env.GITHUB_REPOSITORY = "owner/repo";
  mockFetch.mockReset();
});

it("returns vulnerability counts by severity", async () => {
  const trivyData = {
    SchemaVersion: 2,
    ArtifactName: ".",
    Results: [
      {
        Target: "package.json",
        Vulnerabilities: [
          {
            VulnerabilityID: "CVE-2026-0001",
            Severity: "CRITICAL",
            PkgName: "pkg-a",
          },
          {
            VulnerabilityID: "CVE-2026-0002",
            Severity: "HIGH",
            PkgName: "pkg-b",
          },
          {
            VulnerabilityID: "CVE-2026-0003",
            Severity: "HIGH",
            PkgName: "pkg-c",
          },
          {
            VulnerabilityID: "CVE-2026-0004",
            Severity: "MEDIUM",
            PkgName: "pkg-d",
          },
        ],
      },
    ],
  };

  mockFetch.mockImplementation((url: string | Request | URL) => {
    const u = String(url);
    if (u === GITHUB_CONTENT_API) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(trivyData)).toString("base64"),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    }
    if (u === BLOB_URL) {
      return Promise.resolve(new Response(null, { status: 404 }));
    }
    return Promise.resolve(new Response(null, { status: 404 }));
  });

  const res = await GET(mockRequest);
  const json = await res.json();
  expect(json.bySeverity).toBeDefined();
  expect(json.bySeverity.critical).toBe(1);
  expect(json.bySeverity.high).toBe(2);
  expect(json.bySeverity.medium).toBe(1);
  expect(json.total).toBe(4);
});
