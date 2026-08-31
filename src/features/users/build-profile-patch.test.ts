import { describe, expect, it } from "vitest";
import type { ProfileSettingsFormValues } from "@/lib/form-schemas";
import {
  buildProfilePatch,
  isProfilePatchEmpty,
  profileFormValuesFromUser,
} from "./build-profile-patch";

const loaded: ProfileSettingsFormValues = {
  displayName: "Ada",
  bio: "Mathematician",
  location: "London",
  website: "https://ada.dev",
  github: "ada",
  avatarUrl: "https://example.com/ada.png",
  coverImageUrl: "",
};

describe("buildProfilePatch", () => {
  it("sends only dirty fields", () => {
    expect(
      buildProfilePatch({ ...loaded, location: "Manchester" }, loaded),
    ).toEqual({ location: "Manchester" });
  });

  it("sends null for emptied fields", () => {
    expect(
      buildProfilePatch({ ...loaded, bio: "", website: "   " }, loaded),
    ).toEqual({ bio: null, website: null });
  });

  it("sends null when displayName is emptied", () => {
    expect(
      buildProfilePatch({ ...loaded, displayName: "" }, loaded),
    ).toEqual({ displayName: null });
  });

  it("does not send a field that is already empty", () => {
    const emptyLoaded = profileFormValuesFromUser({
      displayName: "Ada",
      bio: null,
    });
    expect(buildProfilePatch(emptyLoaded, emptyLoaded)).toEqual({});
  });
});

describe("isProfilePatchEmpty", () => {
  it("detects an empty patch", () => {
    expect(isProfilePatchEmpty({})).toBe(true);
    expect(isProfilePatchEmpty({ bio: null })).toBe(false);
  });
});
