import { describe, expect, it, vi } from "vitest";
import { QueryClient, type QueryFunctionContext } from "@tanstack/react-query";
import { applyMinPending, wrapQueryFn, withMinDuration } from "./min-pending";

function flushMicrotasks() {
  return Promise.resolve();
}

function makeContext(
  cached: unknown,
  signal: AbortSignal = new AbortController().signal,
): QueryFunctionContext {
  const client = new QueryClient();
  if (cached !== undefined) {
    client.setQueryData(["test"], cached);
  }

  return {
    client,
    queryKey: ["test"],
    signal,
    meta: undefined,
  };
}

describe("withMinDuration", () => {
  it("pads a fast success to the minimum duration", async () => {
    vi.useFakeTimers();
    const promise = withMinDuration(Promise.resolve("ok"), 300);
    let settled = false;
    void promise.then(() => {
      settled = true;
    });

    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(299);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe("ok");
    expect(settled).toBe(true);
    vi.useRealTimers();
  });

  it("pads a fast error to the minimum duration", async () => {
    vi.useFakeTimers();
    const promise = withMinDuration(Promise.reject(new Error("boom")), 300);
    let settled = false;
    void promise.catch(() => {
      settled = true;
    });

    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(299);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).rejects.toThrow("boom");
    expect(settled).toBe(true);
    vi.useRealTimers();
  });

  it("does not pad work that already took at least minMs", async () => {
    let now = 0;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const result = await withMinDuration(
      Promise.resolve().then(() => {
        now = 500;
        return "ok";
      }),
      300,
    );

    expect(result).toBe("ok");
    vi.restoreAllMocks();
  });
});

describe("wrapQueryFn", () => {
  it("pads first fetches that have no cached data", async () => {
    vi.useFakeTimers();
    const queryFn = wrapQueryFn(async () => "ok", 300);
    const promise = Promise.resolve(queryFn(makeContext(undefined)));
    let settled = false;
    void promise.then(() => {
      settled = true;
    });

    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(299);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe("ok");
    vi.useRealTimers();
  });

  it("does not pad when cached data already exists", async () => {
    vi.useFakeTimers();
    const queryFn = wrapQueryFn(async () => "ok", 300);
    await expect(
      Promise.resolve(queryFn(makeContext({ id: 1 }))),
    ).resolves.toBe("ok");
    vi.useRealTimers();
  });
});

describe("applyMinPending", () => {
  it("leaves options without a queryFn unchanged", () => {
    const options = { queryKey: ["posts"] };
    expect(applyMinPending(options)).toBe(options);
  });

  it("leaves queryFn unchanged when minPending is disabled", () => {
    const queryFn = async () => "ok";
    const options = {
      queryKey: ["auth", "session"],
      queryFn,
      meta: { minPending: false as const },
    };

    expect(applyMinPending(options).queryFn).toBe(queryFn);
  });
});
