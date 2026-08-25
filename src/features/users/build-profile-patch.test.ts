import { describe, expect, it } from "vitest";
import type { ProfileSettingsFormValues } from "@/lib/form-schemas";
import {
  buildProfilePatch,
  isProfilePatchEmpty,
  profileFormValuesFromUser,
  type ClearableProfileField,
} from "./build-profile-patch";

const loaded: ProfileSettingsFormValues = {
  displayName: "Ada",
  bio: "Mathematician",
  location: "London",
  website: "https://ada.dev",
  github: "ada",
  avatarUrl: "https://example.com/ada.png",
};

describe("buildProfilePatch", () => {
  it("sends only dirty fields", () => {
    expect(
      buildProfilePatch(
        { ...loaded, location: "Manchester" },
        loaded,
        new Set(),
      ),
    ).toEqual({ location: "Manchester" });
  });

  it("omits emptied fields unless they were explicitly cleared", () => {
    expect(
      buildProfilePatch({ ...loaded, bio: "", website: "" }, loaded, new Set()),
    ).toEqual({});
  });

  it("sends null for explicitly cleared optional fields that had a value", () => {
    const cleared = new Set<ClearableProfileField>(["bio", "github"]);
    expect(
      buildProfilePatch({ ...loaded, bio: "", github: "" }, loaded, cleared),
    ).toEqual({ bio: null, github: null });
  });

  it("does not send null when clearing an already empty field", () => {
    const emptyLoaded = profileFormValuesFromUser({
      displayName: "Ada",
      bio: null,
    });
    expect(
      buildProfilePatch(
        emptyLoaded,
        emptyLoaded,
        new Set<ClearableProfileField>(["bio"]),
      ),
    ).toEqual({});
  });

  it("does not clear displayName when the input is emptied", () => {
    expect(
      buildProfilePatch({ ...loaded, displayName: "" }, loaded, new Set()),
    ).toEqual({});
  });
});

describe("isProfilePatchEmpty", () => {
  it("detects an empty patch", () => {
    expect(isProfilePatchEmpty({})).toBe(true);
    expect(isProfilePatchEmpty({ bio: null })).toBe(false);
  });
});
