import { describe, expect, it } from "vitest";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { authQueryOptionsFactory } from "@/features/auth/auth-query-options-factory";
import { commentsQueryOptionsFactory } from "@/features/comments/comments-query-options-factory";
import { notificationsQueryOptionsFactory } from "@/features/notifications/notifications-query-options-factory";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { topicsQueryOptionsFactory } from "@/features/topics/topics-query-options-factory";

describe("query option factories", () => {
  it("nests auth keys under auth", () => {
    expect(authQueryOptionsFactory.all().queryKey).toEqual(["auth"]);
    expect(authQueryOptionsFactory.session().queryKey).toEqual([
      "auth",
      "session",
    ]);
  });

  it("nests post keys under posts", () => {
    expect(postsQueryOptionsFactory.all().queryKey).toEqual(["posts"]);
    expect(postsQueryOptionsFactory.feedLists().queryKey).toEqual([
      "posts",
      "feed",
    ]);
    expect(postsQueryOptionsFactory.feedList({ authorId: "u1" }).queryKey).toEqual([
      "posts",
      "feed",
      { authorId: "u1" },
    ]);
    expect(postsQueryOptionsFactory.details("post-1").queryKey).toEqual([
      "posts",
      "details",
      "post-1",
    ]);
  });

  it("nests comment keys under comments", () => {
    expect(commentsQueryOptionsFactory.all().queryKey).toEqual(["comments"]);
    expect(commentsQueryOptionsFactory.thread("post-1", "POST").queryKey).toEqual([
      "comments",
      "POST",
      "post-1",
      "thread",
    ]);
    expect(commentsQueryOptionsFactory.replies("c1").queryKey).toEqual([
      "comments",
      "replies",
      "c1",
    ]);
    expect(
      commentsQueryOptionsFactory.mentionCandidates(
        "post-1",
        "POST",
        undefined,
        "ad",
      ).queryKey,
    ).toEqual(["comments", "mention-candidates", "POST", "post-1", undefined, "ad"]);
  });

  it("nests notification keys under notifications", () => {
    expect(notificationsQueryOptionsFactory.all().queryKey).toEqual([
      "notifications",
    ]);
    expect(notificationsQueryOptionsFactory.lists().queryKey).toEqual([
      "notifications",
      "list",
    ]);
    expect(
      notificationsQueryOptionsFactory.list(10, { isRead: false }).queryKey,
    ).toEqual(["notifications", "list", 10, { isRead: false }]);
    expect(notificationsQueryOptionsFactory.unreadCount().queryKey).toEqual([
      "notifications",
      "unread-count",
    ]);
  });

  it("nests user keys under users", () => {
    expect(usersQueryOptionsFactory.all().queryKey).toEqual(["users"]);
    expect(usersQueryOptionsFactory.myProfile().queryKey).toEqual([
      "users",
      "profile",
      "me",
    ]);
    expect(usersQueryOptionsFactory.profile("u1").queryKey).toEqual([
      "users",
      "profile",
      "u1",
    ]);
    expect(usersQueryOptionsFactory.preview("u1").queryKey).toEqual([
      "users",
      "profile",
      "preview",
      "u1",
    ]);
    expect(usersQueryOptionsFactory.notificationPreferences().queryKey).toEqual([
      "users",
      "notification-preferences",
    ]);
    expect(usersQueryOptionsFactory.followers("u1").queryKey).toEqual([
      "users",
      "followers",
      "u1",
    ]);
    expect(usersQueryOptionsFactory.following("u1").queryKey).toEqual([
      "users",
      "following",
      "u1",
    ]);
  });

  it("nests topic keys under topics", () => {
    expect(topicsQueryOptionsFactory.all().queryKey).toEqual(["topics"]);
    expect(topicsQueryOptionsFactory.list().queryKey).toEqual([
      "topics",
      "list",
      "guest",
    ]);
    expect(topicsQueryOptionsFactory.list("u1").queryKey).toEqual([
      "topics",
      "list",
      "u1",
    ]);
    expect(topicsQueryOptionsFactory.bySlug("react").queryKey).toEqual([
      "topics",
      "detail",
      "react",
      "guest",
    ]);
    expect(
      topicsQueryOptionsFactory.bySlug("react", "u1").queryKey,
    ).toEqual(["topics", "detail", "react", "u1"]);
  });

  it("nests article keys under articles", () => {
    expect(articlesQueryOptionsFactory.all().queryKey).toEqual(["articles"]);
    expect(articlesQueryOptionsFactory.lists().queryKey).toEqual([
      "articles",
      "list",
    ]);
    expect(
      articlesQueryOptionsFactory.list({ search: "hooks", page: 2 }).queryKey,
    ).toEqual(["articles", "list", { search: "hooks", page: 2 }]);
    expect(articlesQueryOptionsFactory.publishedAuthors().queryKey).toEqual([
      "articles",
      "authors",
    ]);
    expect(articlesQueryOptionsFactory.details("slug-1").queryKey).toEqual([
      "articles",
      "details",
      "slug-1",
    ]);
  });
});
