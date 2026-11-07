export type PollState<T> = {
  data: T | null;
  stale: boolean;
  lastUpdated: string | null;
};

export async function startPoll<T>(
  intervalMs: number,
  fetchFn: () => Promise<T>,
  onUpdate: (state: PollState<T>) => void
): Promise<PollState<T>> {
  async function tick(): Promise<PollState<T>> {
    try {
      const data = await fetchFn();
      const state: PollState<T> = {
        data,
        stale: false,
        lastUpdated: new Date().toISOString(),
      };
      onUpdate(state);
      return state;
    } catch {
      const state: PollState<T> = {
        data: null,
        stale: true,
        lastUpdated: null,
      };
      onUpdate(state);
      return state;
    }
  }

  const result = await tick();

  setInterval(() => {
    void tick();
  }, intervalMs);

  return result;
}
