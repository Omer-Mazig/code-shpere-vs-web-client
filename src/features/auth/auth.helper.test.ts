import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createZodValidator } from "./auth.helper";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
});

describe("createZodValidator", () => {
  const validate = createZodValidator(schema);

  it("returns undefined for valid values", () => {
    expect(validate({ email: "ada@example.com", name: "Ada" })).toBeUndefined();
  });

  it("returns the first message per field path", () => {
    expect(validate({ email: "nope", name: "" })).toEqual({
      email: "Please enter a valid email address",
      name: "Name is required",
    });
  });
});
