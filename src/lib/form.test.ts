import { describe, expect, it, vi } from "vitest";
import { applyApiFieldErrors, isFieldInvalid } from "./form";

describe("isFieldInvalid", () => {
  it("requires a touched invalid field", () => {
    expect(
      isFieldInvalid({
        state: { meta: { isTouched: false, isValid: false } },
      }),
    ).toBe(false);
    expect(
      isFieldInvalid({
        state: { meta: { isTouched: true, isValid: false } },
      }),
    ).toBe(true);
  });

  it("shows server field errors even before touch", () => {
    expect(
      isFieldInvalid({
        state: {
          meta: {
            isTouched: false,
            isValid: false,
            errorMap: { onServer: { message: "Too long" } },
          },
        },
      }),
    ).toBe(true);
  });
});

describe("applyApiFieldErrors", () => {
  it("sets onServer errors for fields that exist on the form", () => {
    const setFieldMeta = vi.fn();
    const form = {
      getFieldMeta: (name: string) => (name === "password" ? {} : undefined),
      setFieldMeta,
    };

    expect(
      applyApiFieldErrors(form, [
        { field: "password", message: "Too short" },
        { field: "unknown", message: "ignored" },
      ]),
    ).toBe(true);

    expect(setFieldMeta).toHaveBeenCalledTimes(1);
    const updater = setFieldMeta.mock.calls[0][1] as (prev: {
      errorMap?: Record<string, unknown>;
    }) => { errorMap?: Record<string, unknown>; isTouched?: boolean };
    expect(updater({ errorMap: { onSubmit: "client" } })).toEqual({
      errorMap: {
        onSubmit: "client",
        onServer: { message: "Too short" },
      },
      isTouched: true,
    });
  });

  it("returns false when no details match a form field", () => {
    const form = {
      getFieldMeta: () => undefined,
      setFieldMeta: vi.fn(),
    };

    expect(
      applyApiFieldErrors(form, [{ field: "password", message: "Too short" }]),
    ).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });
});
