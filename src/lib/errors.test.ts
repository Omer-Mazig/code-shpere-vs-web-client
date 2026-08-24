import { describe, expect, it } from "vitest";
import { getApiError, isNotFoundError } from "./errors";
import { makeAxiosError } from "@/test/make-axios-error";

describe("isNotFoundError", () => {
  it("returns true for Axios 404 responses", () => {
    expect(isNotFoundError(makeAxiosError({ status: 404 }))).toBe(true);
  });

  it("returns false for other statuses and non-Axios errors", () => {
    expect(isNotFoundError(makeAxiosError({ status: 500 }))).toBe(false);
    expect(isNotFoundError(new Error("boom"))).toBe(false);
    expect(isNotFoundError("not-an-error")).toBe(false);
  });
});

describe("getApiError", () => {
  it("returns an empty object for non-Axios errors", () => {
    expect(getApiError(new Error("boom"))).toEqual({});
  });

  it("uses the HTTP status when the body is missing", () => {
    expect(getApiError(makeAxiosError({ status: 503 }))).toEqual({
      statusCode: 503,
    });
  });

  it("reads statusCode, errorCode, and message from the body", () => {
    expect(
      getApiError(
        makeAxiosError({
          status: 400,
          data: {
            statusCode: 400,
            errorCode: "USER_EMAIL_EXISTS",
            message: "Email already exists",
          },
        }),
      ),
    ).toEqual({
      statusCode: 400,
      errorCode: "USER_EMAIL_EXISTS",
      message: "Email already exists",
    });
  });

  it("falls back to the HTTP status when the body omits statusCode", () => {
    expect(
      getApiError(
        makeAxiosError({
          status: 401,
          data: { errorCode: "UNAUTHORIZED", message: "Nope" },
        }),
      ),
    ).toEqual({
      statusCode: 401,
      errorCode: "UNAUTHORIZED",
      message: "Nope",
    });
  });
});
