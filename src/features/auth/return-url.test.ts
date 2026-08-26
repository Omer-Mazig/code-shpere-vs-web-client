import { describe, expect, it } from "vitest";
import { AUTH_PATHS, FEED_PATHS } from "@/lib/routes.constants";
import {
  isSafeReturnUrl,
  readReturnUrl,
  sanitizeReturnUrl,
  signInPathWithReturnUrl,
} from "./return-url";

describe("isSafeReturnUrl", () => {
  it("accepts in-app relative paths", () => {
    expect(isSafeReturnUrl("/articles/new")).toBe(true);
    expect(isSafeReturnUrl("/feed/abc?tab=comments#top")).toBe(true);
  });

  it("rejects open redirects", () => {
    expect(isSafeReturnUrl("https://evil.example")).toBe(false);
    expect(isSafeReturnUrl("//evil.example")).toBe(false);
    expect(isSafeReturnUrl("/\\evil.example")).toBe(false);
    expect(isSafeReturnUrl("articles/new")).toBe(false);
  });
});

describe("sanitizeReturnUrl", () => {
  it("returns the fallback for missing or unsafe values", () => {
    expect(sanitizeReturnUrl(undefined)).toBe(FEED_PATHS.FEED);
    expect(sanitizeReturnUrl("https://evil.example")).toBe(FEED_PATHS.FEED);
    expect(sanitizeReturnUrl("//evil.example")).toBe(FEED_PATHS.FEED);
    expect(sanitizeReturnUrl("%2F%2Fevil.example")).toBe(FEED_PATHS.FEED);
  });

  it("does not return to auth routes after login", () => {
    expect(sanitizeReturnUrl(AUTH_PATHS.SIGN_IN)).toBe(FEED_PATHS.FEED);
    expect(sanitizeReturnUrl("/auth/sign-up")).toBe(FEED_PATHS.FEED);
  });

  it("keeps a protected in-app destination", () => {
    expect(sanitizeReturnUrl("/articles/new")).toBe("/articles/new");
    expect(sanitizeReturnUrl("/notifications?tab=unread")).toBe(
      "/notifications?tab=unread",
    );
  });
});

describe("readReturnUrl", () => {
  it("prefers the query param over location state", () => {
    expect(
      readReturnUrl(
        new URLSearchParams("returnUrl=%2Farticles%2Fnew"),
        { returnUrl: "/feed" },
      ),
    ).toBe("/articles/new");
  });

  it("falls back to location state", () => {
    expect(readReturnUrl(new URLSearchParams(), { returnUrl: "/notifications" })).toBe(
      "/notifications",
    );
  });
});

describe("signInPathWithReturnUrl", () => {
  it("stashes a safe path on the sign-in URL", () => {
    expect(signInPathWithReturnUrl("/articles/new")).toBe(
      "/auth/sign-in?returnUrl=%2Farticles%2Fnew",
    );
  });

  it("omits unsafe destinations", () => {
    expect(signInPathWithReturnUrl("https://evil.example")).toBe(
      AUTH_PATHS.SIGN_IN,
    );
  });
});
