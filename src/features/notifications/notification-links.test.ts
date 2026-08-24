import { describe, expect, it } from "vitest";
import type { NotificationPayload } from "./types";
import {
  getNotificationHref,
  getNotificationTargetInfo,
  getNotificationVerb,
} from "./notification-links";

const payload = (overrides: NotificationPayload = {}): NotificationPayload =>
  overrides;

describe("getNotificationHref", () => {
  it("routes followers to the actor profile", () => {
    expect(
      getNotificationHref("NEW_FOLLOWER", payload({ actorId: "user-1" })),
    ).toBe("/profile/user-1");
  });

  it("routes post like and comment notifications to the post", () => {
    expect(
      getNotificationHref("POST_LIKED", payload({ postId: "post-1" })),
    ).toBe("/feed/post-1");
    expect(
      getNotificationHref("POST_COMMENTED", payload({ postId: "post-1" })),
    ).toBe("/feed/post-1");
  });

  it("routes comment replies by target type", () => {
    expect(
      getNotificationHref(
        "COMMENT_REPLIED",
        payload({ targetType: "POST", targetId: "post-2" }),
      ),
    ).toBe("/feed/post-2");
    expect(
      getNotificationHref(
        "COMMENT_REPLIED",
        payload({ targetType: "ARTICLE", articleSlug: "hello-world" }),
      ),
    ).toBe("/articles/hello-world");
  });

  it("falls back to the feed when required ids are missing", () => {
    expect(getNotificationHref("POST_LIKED", payload())).toBe("/feed");
    expect(getNotificationHref("NEW_FOLLOWER", payload())).toBe("/feed");
    expect(getNotificationHref("COMMENT_REPLIED", payload())).toBe("/feed");
  });
});

describe("getNotificationTargetInfo", () => {
  it("uses excerpts with fallback labels", () => {
    expect(
      getNotificationTargetInfo(
        "POST_LIKED",
        payload({ postId: "post-1", postExcerpt: "shipped it" }),
      ),
    ).toEqual({ href: "/feed/post-1", label: "shipped it" });

    expect(
      getNotificationTargetInfo("POST_LIKED", payload({ postId: "post-1" })),
    ).toEqual({ href: "/feed/post-1", label: "your post" });

    expect(
      getNotificationTargetInfo(
        "POST_COMMENTED",
        payload({
          postId: "post-1",
          commentExcerpt: "nice",
          postExcerpt: "shipped it",
        }),
      ),
    ).toEqual({ href: "/feed/post-1", label: "nice" });
  });

  it("returns null when there is no target", () => {
    expect(getNotificationTargetInfo("NEW_FOLLOWER", payload())).toBeNull();
    expect(getNotificationTargetInfo("POST_LIKED", payload())).toBeNull();
  });
});

describe("getNotificationVerb", () => {
  it("returns copy for each notification type", () => {
    expect(getNotificationVerb("POST_LIKED")).toBe("liked your post");
    expect(getNotificationVerb("POST_COMMENTED")).toBe(
      "commented on your post",
    );
    expect(getNotificationVerb("COMMENT_REPLIED")).toBe(
      "replied to your comment",
    );
    expect(getNotificationVerb("NEW_FOLLOWER")).toBe("started following you");
  });
});
