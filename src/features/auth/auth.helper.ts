import type { ZodType, ZodError } from "zod";
import type { ValidationError } from "@tanstack/react-form";

export function createZodValidator<T>(
  schema: ZodType<T>,
): (value: T) => ValidationError | undefined {
  return (value: T) => {
    const result = schema.safeParse(value);
    if (result.success) return undefined;

    const zodError = result.error as ZodError;
    const fieldErrors: Record<string, string> = {};

    for (const issue of zodError.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }

    return fieldErrors;
  };
}
