/// <reference types="vitest/globals" />
import { GET } from "./route";

const mockRequest = new Request("http://localhost/api/compliance");

const mockFetch = vi.spyOn(globalThis, "fetch");

const GITHUB_CONTENT_API =
  "https://api.github.com/repos/owner/repo/contents/compliance/last-run.json";
const BLOB_URL = "https://public.blob.vercel-storage.com/dashboard-state.json";

beforeEach(() => {
  process.env.GITHUB_REPOSITORY = "owner/repo";
  mockFetch.mockReset();
});

it("returns compliance score from last-run.json", async () => {
  mockFetch.mockImplementation((input: string | Request | URL) => {
    const url = String(input);
    if (url === GITHUB_CONTENT_API) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            content: "eyJzY29yZSI6ODUsInRvdGFsUnVsZXMiOjUsInBhc3NlZFJ1bGVzIjo0LCJmYWlsZWRSdWxlcyI6MSwicnVsZXMiOlt7Im5hbWUiOiJyZXF1aXJlLXRlYW0tbGFiZWwiLCJzdGF0dXMiOiJwYXNzIiwicmVtZWRpYXRpb24iOiJBZGQgdGVhbSBsYWJlbCJ9LHsibmFtZSI6ImRpc2FsbG93LWxhdGVzdC10YWciLCJzdGF0dXMiOiJmYWlsIiwicmVtZWRpYXRpb24iOiJVc2UgcGlubmVkIGltYWdlIHRhZ3MifV0sImxhc3RDaGVja2VkIjoiMjAyNi0xMS0wN1QxMDowMDowMFoifQ==",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    }
    if (url === BLOB_URL) {
      return Promise.resolve(new Response(null, { status: 404 }));
    }
    return Promise.resolve(new Response(null, { status: 404 }));
  });

  const res = await GET(mockRequest);
  const json = await res.json();
  expect(json.score).toBe(85);
  expect(json.rules.length).toBe(2);
});
