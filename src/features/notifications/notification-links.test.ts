import { describe, expect, it } from "vitest";
import type { NotificationPayload } from "./types";
import {
  getNotificationCollapsedOthers,
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

const articleLiked = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "ARTICLE_LIKED" }>
  > = {},
): NotificationPayload => ({
  type: "ARTICLE_LIKED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "ARTICLE",
  articleSlug: "hello-world",
  articleExcerpt: "Hello world",
  createdAt: CREATED_AT,
  ...overrides,
});

const articleCommented = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "ARTICLE_COMMENTED" }>
  > = {},
): NotificationPayload => ({
  type: "ARTICLE_COMMENTED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "ARTICLE",
  articleSlug: "hello-world",
  articleExcerpt: "Hello world",
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

const userMentioned = (
  overrides: Partial<
    Extract<NotificationPayload, { type: "USER_MENTIONED" }>
  > = {},
): NotificationPayload => ({
  type: "USER_MENTIONED",
  actorId: "actor-1",
  actorName: "Ada",
  actorAvatarUrl: null,
  targetType: "POST",
  postId: "post-1",
  excerpt: "hey @grace",
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

  it("routes article like and comment notifications to the article", () => {
    expect(getNotificationHref(articleLiked())).toBe("/articles/hello-world");
    expect(getNotificationHref(articleCommented())).toBe(
      "/articles/hello-world",
    );
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

  it("routes mention notifications to the post or article", () => {
    expect(getNotificationHref(userMentioned())).toBe("/feed/post-1");
    expect(
      getNotificationHref(
        userMentioned({
          targetType: "ARTICLE",
          postId: undefined,
          articleSlug: "hello-world",
        }),
      ),
    ).toBe("/articles/hello-world");
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

    expect(getNotificationTargetInfo(articleLiked())).toEqual({
      href: "/articles/hello-world",
      label: "Hello world",
    });

    expect(getNotificationTargetInfo(articleCommented())).toEqual({
      href: "/articles/hello-world",
      label: "nice",
    });
  });

  it("returns null when there is no target", () => {
    expect(getNotificationTargetInfo(newFollower())).toBeNull();
    expect(getNotificationTargetInfo(userMentioned())).toEqual({
      href: "/feed/post-1",
      label: "hey @grace",
    });
  });
});

describe("getNotificationVerb", () => {
  it("returns copy for each notification type", () => {
    expect(getNotificationVerb(postLiked())).toBe("liked your post");
    expect(getNotificationVerb(postCommented())).toBe("commented on your post");
    expect(getNotificationVerb(articleLiked())).toBe("liked your article");
    expect(getNotificationVerb(articleCommented())).toBe(
      "commented on your article",
    );
    expect(getNotificationVerb(commentReplied())).toBe(
      "replied to your comment",
    );
    expect(getNotificationVerb(newFollower())).toBe("started following you");
    expect(getNotificationVerb(userMentioned())).toBe("mentioned you");
  });
});

describe("getNotificationCollapsedOthers", () => {
  it("returns null for a single actor", () => {
    expect(getNotificationCollapsedOthers(postLiked())).toBeNull();
    expect(
      getNotificationCollapsedOthers(postLiked({ actorCount: 1 })),
    ).toBeNull();
  });

  it("names the second actor when there are exactly two", () => {
    expect(
      getNotificationCollapsedOthers(
        postLiked({
          actorId: "bob",
          actorName: "Bob",
          actorIds: ["bob", "ada"],
          actorNames: ["Bob", "Ada"],
          actorCount: 2,
        }),
      ),
    ).toEqual({ kind: "named", actorId: "ada", actorName: "Ada" });
  });

  it("uses count copy for three or more actors", () => {
    expect(
      getNotificationCollapsedOthers(
        postLiked({
          actorCount: 10,
          actorIds: ["a", "b", "c"],
          actorNames: ["A", "B", "C"],
        }),
      ),
    ).toEqual({ kind: "count", count: 9 });
  });
});
