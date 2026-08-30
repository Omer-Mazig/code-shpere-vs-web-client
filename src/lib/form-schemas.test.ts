import { describe, expect, it } from "vitest";
import {
  isPasswordChangeRequested,
  settingsFormSchema,
} from "./form-schemas";

const baseSettings = {
  displayName: "Ada",
  bio: "",
  location: "",
  github: "",
  website: "",
  avatarUrl: "",
  mentions: true,
  comments: true,
  likes: true,
  newFollowers: true,
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

describe("settingsFormSchema", () => {
  it("accepts empty password fields so Save can skip a password change", () => {
    expect(settingsFormSchema.safeParse(baseSettings).success).toBe(true);
    expect(isPasswordChangeRequested(baseSettings)).toBe(false);
  });

  it("requires current, policy-valid new, and matching confirm when any password field is filled", () => {
    const missingCurrent = settingsFormSchema.safeParse({
      ...baseSettings,
      newPassword: "Password2",
      confirmNewPassword: "Password2",
    });
    expect(missingCurrent.success).toBe(false);

    const weakNew = settingsFormSchema.safeParse({
      ...baseSettings,
      currentPassword: "Password1",
      newPassword: "short",
      confirmNewPassword: "short",
    });
    expect(weakNew.success).toBe(false);

    const mismatch = settingsFormSchema.safeParse({
      ...baseSettings,
      currentPassword: "Password1",
      newPassword: "Password2",
      confirmNewPassword: "Password3",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.message).toBe("Passwords do not match");
    }

    const valid = settingsFormSchema.safeParse({
      ...baseSettings,
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
