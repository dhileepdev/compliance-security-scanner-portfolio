export type PollState<T> = {
  data: T | null;
  stale: boolean;
  lastUpdated: string | null;
};

export type PollHandle<T> = PollState<T> & {
  stop: () => void;
  refresh: () => Promise<PollState<T>>;
};

export async function startPoll<T>(
  intervalMs: number,
  fetchFn: () => Promise<T>,
  onUpdate: (state: PollState<T>) => void
): Promise<PollHandle<T>> {
  let lastData: T | null = null;

  async function tick(): Promise<PollState<T>> {
    try {
      const data = await fetchFn();
      lastData = data;
      const state: PollState<T> = {
        data,
        stale: false,
        lastUpdated: new Date().toISOString(),
      };
      onUpdate(state);
      return state;
    } catch {
      const state: PollState<T> = {
        data: lastData,
        stale: true,
        lastUpdated: null,
      };
      onUpdate(state);
      return state;
    }
  }

  const result = await tick();
  const timer = setInterval(() => {
    void tick();
  }, intervalMs);

  return {
    ...result,
    stop: () => clearInterval(timer),
    refresh: () => tick(),
  };
}
