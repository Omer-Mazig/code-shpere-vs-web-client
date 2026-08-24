import { describe, expect, it } from "vitest";
import type { Query } from "@tanstack/react-query";
import { z } from "zod";
import { handleRetry, handleThrowOnError } from "./query-client";
import { makeAxiosError } from "@/test/make-axios-error";

function asQuery(data: unknown): Query {
  return { state: { data } } as Query;
}

describe("handleRetry", () => {
  it("stops after the retry limit", () => {
    expect(handleRetry(3, makeAxiosError({ status: 500 }))).toBe(false);
  });

  it("does not retry Zod validation errors", () => {
    let zodError: unknown;
    try {
      z.string().parse(1);
    } catch (error) {
      zodError = error;
    }

    expect(handleRetry(0, zodError)).toBe(false);
  });

  it("does not retry cancelled requests", () => {
    expect(handleRetry(0, makeAxiosError({ code: "ERR_CANCELED" }))).toBe(
      false,
    );
  });

  it("retries network errors and selected 4xx timeouts", () => {
    expect(handleRetry(0, makeAxiosError())).toBe(true);
    expect(handleRetry(0, makeAxiosError({ status: 408 }))).toBe(true);
    expect(handleRetry(0, makeAxiosError({ status: 429 }))).toBe(true);
  });

  it("does not retry other 4xx client errors", () => {
    expect(handleRetry(0, makeAxiosError({ status: 400 }))).toBe(false);
    expect(handleRetry(0, makeAxiosError({ status: 401 }))).toBe(false);
    expect(handleRetry(0, makeAxiosError({ status: 404 }))).toBe(false);
  });

  it("retries 5xx and unknown errors", () => {
    expect(handleRetry(0, makeAxiosError({ status: 500 }))).toBe(true);
    expect(handleRetry(0, makeAxiosError({ status: 503 }))).toBe(true);
    expect(handleRetry(0, new Error("weird"))).toBe(true);
  });
});

describe("handleThrowOnError", () => {
  it("does not throw when cached data already exists", () => {
    expect(
      handleThrowOnError(makeAxiosError({ status: 500 }), asQuery({ id: "1" })),
    ).toBe(false);
  });

  it("throws on 5xx when there is no cached data", () => {
    expect(
      handleThrowOnError(makeAxiosError({ status: 500 }), asQuery(undefined)),
    ).toBe(true);
  });

  it("does not throw on 4xx or non-Axios errors", () => {
    expect(
      handleThrowOnError(makeAxiosError({ status: 404 }), asQuery(undefined)),
    ).toBe(false);
    expect(handleThrowOnError(new Error("boom"), asQuery(undefined))).toBe(
      false,
    );
  });
});
