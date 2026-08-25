import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./auth.errors";
import { makeAxiosError } from "@/test/make-axios-error";

describe("getAuthErrorMessage", () => {
  it("maps rate limits and conflict codes to stable copy", () => {
    expect(
      getAuthErrorMessage(makeAxiosError({ status: 429 })),
    ).toBe("Too many attempts. Please try again later.");
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 400,
          data: { errorCode: "RATE_LIMIT_EXCEEDED" },
        }),
      ),
    ).toBe("Too many attempts. Please try again later.");
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 409,
          data: { errorCode: "USER_EMAIL_EXISTS" },
        }),
      ),
    ).toBe("An account with this email already exists.");
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 409,
          data: { errorCode: "USER_USERNAME_EXISTS" },
        }),
      ),
    ).toBe("This username is already taken.");
  });

  it("prefers the API message for verification-token errors", () => {
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 400,
          data: { errorCode: "EMAIL_VERIFICATION_TOKEN_EXPIRED" },
        }),
      ),
    ).toBe("This verification link has expired. Request a new one.");
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 400,
          data: { errorCode: "EMAIL_VERIFICATION_TOKEN_INVALID" },
        }),
      ),
    ).toBe("This verification link is invalid or has already been used.");
  });

  it("maps 401 to invalid credentials and uses fallback otherwise", () => {
    expect(getAuthErrorMessage(makeAxiosError({ status: 401 }))).toBe(
      "Invalid credentials. Please try again.",
    );
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 403,
          data: {
            errorCode: "EMAIL_NOT_VERIFIED",
            message: "Please verify first.",
          },
        }),
      ),
    ).toBe("Please verify first.");
    expect(getAuthErrorMessage(new Error("boom"), "Try later.")).toBe(
      "Try later.",
    );
    expect(
      getAuthErrorMessage(
        makeAxiosError({
          status: 500,
          data: { message: "Database down" },
        }),
      ),
    ).toBe("Database down");
  });
});
