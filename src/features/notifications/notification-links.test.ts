import { describe, expect, it } from "vitest";
import type { NotificationPayload } from "./types";
import {
  getNotificationHref,
  getNotificationTargetInfo,
  getNotificationVerb,
} from "./notification-links";

const CREATED_AT = "2026-08-01T00:00:00.000Z";

const postLiked = (
  overrides: Partial<Extract<NotificationPayload, { type: "POST_LIKED" }>> = {},
): NotificationPayload => ({
  type: "POST_LIKED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "POST",
  postId: "post-1",
  postExcerpt: "shipped it",
  createdAt: CREATED_AT,
  ...overrides,
});

const postCommented = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "POST_COMMENTED" }>
  > = {},
): NotificationPayload => ({
  type: "POST_COMMENTED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "POST",
  postId: "post-1",
  postExcerpt: "shipped it",
  commentId: "comment-1",
  commentExcerpt: "nice",
  createdAt: CREATED_AT,
  ...overrides,
});

const commentReplied = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "COMMENT_REPLIED" }>
  > = {},
): NotificationPayload => ({
  type: "COMMENT_REPLIED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "POST",
  targetId: "post-2",
  parentCommentId: "parent-1",
  replyCommentId: "reply-1",
  replyExcerpt: "agreed",
  createdAt: CREATED_AT,
  ...overrides,
});

const newFollower = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "NEW_FOLLOWER" }>
  > = {},
): NotificationPayload => ({
  type: "NEW_FOLLOWER",
  actorId: "user-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "USER",
  createdAt: CREATED_AT,
  ...overrides,
});

describe("getNotificationHref", () => {
  it("routes followers to the actor profile", () => {
    expect(getNotificationHref(newFollower())).toBe("/profile/user-1");
  });

  it("routes post like and comment notifications to the post", () => {
    expect(getNotificationHref(postLiked())).toBe("/feed/post-1");
    expect(getNotificationHref(postCommented())).toBe("/feed/post-1");
  });

  it("routes comment replies by target type", () => {
    expect(getNotificationHref(commentReplied())).toBe("/feed/post-2");
    expect(
      getNotificationHref(
        commentReplied({
          targetType: "ARTICLE",
          targetId: "article-1",
          articleSlug: "hello-world",
        }),
      ),
    ).toBe("/articles/hello-world");
  });

  it("falls back to the feed when an article reply has no slug", () => {
    expect(
      getNotificationHref(
        commentReplied({ targetType: "ARTICLE", targetId: "article-1" }),
      ),
    ).toBe("/feed");
  });
});

describe("getNotificationTargetInfo", () => {
  it("uses excerpts with fallback labels", () => {
    expect(getNotificationTargetInfo(postLiked())).toEqual({
      href: "/feed/post-1",
      label: "shipped it",
    });

    expect(
      getNotificationTargetInfo(postLiked({ postExcerpt: "" })),
    ).toEqual({ href: "/feed/post-1", label: "your post" });

    expect(getNotificationTargetInfo(postCommented())).toEqual({
      href: "/feed/post-1",
      label: "nice",
    });
  });

  it("returns null when there is no target", () => {
    expect(getNotificationTargetInfo(newFollower())).toBeNull();
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
