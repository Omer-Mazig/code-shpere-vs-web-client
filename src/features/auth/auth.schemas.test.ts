import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth.schemas";

const validSignUp = {
  email: "ada@example.com",
  username: "ada_lovelace",
  displayName: "Ada",
  password: "secret123",
  confirmPassword: "secret123",
};

describe("signInSchema", () => {
  it("accepts a valid email and password", () => {
    expect(
      signInSchema.safeParse({
        email: "ada@example.com",
        password: "anything",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid email and a blank password", () => {
    const email = signInSchema.safeParse({
      email: "not-an-email",
      password: "x",
    });
    const password = signInSchema.safeParse({
      email: "ada@example.com",
      password: "",
    });

    expect(email.success).toBe(false);
    expect(password.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts a valid payload", () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it("enforces username rules", () => {
    expect(
      signUpSchema.safeParse({ ...validSignUp, username: "ab" }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ ...validSignUp, username: "ada lovelace" })
        .success,
    ).toBe(false);
  });

  it("enforces password rules", () => {
    expect(
      signUpSchema.safeParse({
        ...validSignUp,
        password: "short1",
        confirmPassword: "short1",
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        ...validSignUp,
        password: "longenough",
        confirmPassword: "longenough",
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        ...validSignUp,
        password: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(false);
  });

  it("requires passwords to match", () => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      confirmPassword: "other123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Passwords do not match");
    }
  });
});
