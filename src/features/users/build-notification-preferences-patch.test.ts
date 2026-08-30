import { describe, expect, it } from "vitest";
import {
  buildNotificationPreferencesPatch,
  isNotificationPreferencesPatchEmpty,
} from "./build-notification-preferences-patch";
import type { NotificationPreferences } from "./types";

const loaded: NotificationPreferences = {
  mentions: true,
  comments: true,
  likes: true,
  newFollowers: true,
};

describe("buildNotificationPreferencesPatch", () => {
  it("sends only dirty switches", () => {
    expect(
      buildNotificationPreferencesPatch({ ...loaded, likes: false }, loaded),
    ).toEqual({ likes: false });
  });

  it("sends nothing when prefs are unchanged", () => {
    expect(buildNotificationPreferencesPatch(loaded, loaded)).toEqual({});
  });
});

describe("isNotificationPreferencesPatchEmpty", () => {
  it("detects an empty patch", () => {
    expect(isNotificationPreferencesPatchEmpty({})).toBe(true);
    expect(isNotificationPreferencesPatchEmpty({ likes: false })).toBe(false);
  });
});
