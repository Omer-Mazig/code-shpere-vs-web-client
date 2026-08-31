import { describe, expect, it } from "vitest";
import {
  accountSettingsSchema,
  isPasswordChangeRequested,
} from "./form-schemas";

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

describe("accountSettingsSchema", () => {
  it("accepts empty password fields so Save can skip a password change", () => {
    expect(accountSettingsSchema.safeParse(emptyPasswords).success).toBe(true);
    expect(isPasswordChangeRequested(emptyPasswords)).toBe(false);
  });

  it("requires current, policy-valid new, and matching confirm when any password field is filled", () => {
    const missingCurrent = accountSettingsSchema.safeParse({
      ...emptyPasswords,
      newPassword: "Password2",
      confirmNewPassword: "Password2",
    });
    expect(missingCurrent.success).toBe(false);

    const weakNew = accountSettingsSchema.safeParse({
      currentPassword: "Password1",
      newPassword: "short",
      confirmNewPassword: "short",
    });
    expect(weakNew.success).toBe(false);

    const mismatch = accountSettingsSchema.safeParse({
      currentPassword: "Password1",
      newPassword: "Password2",
      confirmNewPassword: "Password3",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.message).toBe("Passwords do not match");
    }

    const valid = accountSettingsSchema.safeParse({
      currentPassword: "Password1",
      newPassword: "Password2",
      confirmNewPassword: "Password2",
    });
    expect(valid.success).toBe(true);
    expect(
      isPasswordChangeRequested({
        currentPassword: "Password1",
        newPassword: "Password2",
        confirmNewPassword: "Password2",
      }),
    ).toBe(true);
  });
});
