import { describe, expect, it } from "vitest";
import { shouldAttemptTokenRefresh } from "./should-attempt-token-refresh";

describe("shouldAttemptTokenRefresh", () => {
  it("attempts refresh for a first 401 on a protected request", () => {
    expect(shouldAttemptTokenRefresh(401, false, "/posts")).toBe(true);
  });

  it("skips non-401 responses", () => {
    expect(shouldAttemptTokenRefresh(403, false, "/posts")).toBe(false);
    expect(shouldAttemptTokenRefresh(undefined, false, "/posts")).toBe(false);
  });

  it("skips a request that already retried", () => {
    expect(shouldAttemptTokenRefresh(401, true, "/posts")).toBe(false);
  });

  it("skips login and refresh endpoints", () => {
    expect(shouldAttemptTokenRefresh(401, false, "/auth/login")).toBe(false);
    expect(shouldAttemptTokenRefresh(401, false, "/auth/refresh")).toBe(false);
    expect(
      shouldAttemptTokenRefresh(401, false, "/api/auth/login?foo=1"),
    ).toBe(false);
  });
});
