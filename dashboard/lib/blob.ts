import { put } from "@vercel/blob";

const STATE_KEY = "dashboard-state.json";

export async function getState<T>(fallback: T): Promise<T> {
  try {
    const res = await fetch(`https://public.blob.vercel-storage.com/${STATE_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function setState(state: any): Promise<void> {
  try {
    await put(STATE_KEY, JSON.stringify(state), { access: "public" });
  } catch {
    // Blob not configured locally — state won't persist across invocations
  }
}
