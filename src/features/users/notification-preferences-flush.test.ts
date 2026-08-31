import { describe, expect, it } from "vitest";
import { createNotificationPreferencesFlushController } from "./notification-preferences-flush";
import type { NotificationPreferences } from "./types";

const allOn: NotificationPreferences = {
  mentions: true,
  comments: true,
  likes: true,
  newFollowers: true,
};

describe("createNotificationPreferencesFlushController", () => {
  it("sends the diff against the last confirmed snapshot", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);

    expect(
      controller.beginFlush({ ...allOn, likes: false, mentions: false }),
    ).toEqual({ likes: false, mentions: false });
  });

  it("skips a no-op flush when the cache matches the server", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);

    expect(controller.beginFlush(allOn)).toBeNull();
  });

  it("queues a second flush while one is in flight", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);
    controller.beginFlush({ ...allOn, likes: false });

    expect(controller.beginFlush({ ...allOn, likes: false, mentions: false })).toBeNull();

    const result = controller.onSuccess({ ...allOn, likes: false });
    expect(result).toEqual({
      applyServerToCache: false,
      shouldFlushAgain: true,
    });

    expect(
      controller.beginFlush({ ...allOn, likes: false, mentions: false }),
    ).toEqual({ mentions: false });
  });

  it("does not apply a stale success while a later toggle is debounced", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);
    controller.beginFlush({ ...allOn, likes: false });
    controller.setDebouncePending(true);

    expect(controller.onSuccess({ ...allOn, likes: false })).toEqual({
      applyServerToCache: false,
      shouldFlushAgain: false,
    });
  });

  it("applies the server payload when nothing newer is pending", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);
    controller.beginFlush({ ...allOn, likes: false });

    expect(controller.onSuccess({ ...allOn, likes: false })).toEqual({
      applyServerToCache: true,
      shouldFlushAgain: false,
    });
  });

  it("rolls back to the last confirmed snapshot on error", () => {
    const controller = createNotificationPreferencesFlushController();
    controller.seedIfEmpty(allOn);
    controller.beginFlush({ ...allOn, likes: false });
    controller.beginFlush({ ...allOn, likes: false, mentions: false });

    expect(controller.onError()).toEqual(allOn);
    expect(controller.beginFlush(allOn)).toBeNull();
  });
});
