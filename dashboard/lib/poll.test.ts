/// <reference types="vitest/globals" />
import { startPoll } from "./poll";

it("falls back to stale state when fetch fails", async () => {
  const failingFetch = async () => {
    throw new Error("down");
  };
  const onUpdate = vi.fn();
  const state = await startPoll(1000, failingFetch, onUpdate);
  expect(state.stale).toBe(true);
});
