import { describe, expect, it } from "vitest";
import { updateFollowInData } from "./follow-cache";

describe("updateFollowInData", () => {
  it("returns non-objects unchanged", () => {
    expect(updateFollowInData(null, "1", true)).toBeNull();
    expect(updateFollowInData("user", "1", true)).toBe("user");
  });

  it("updates a matching profile and floors followersCount at 0", () => {
    expect(
      updateFollowInData(
        { id: "1", isFollowing: false, followersCount: 2, username: "ada" },
        "1",
        true,
      ),
    ).toEqual({
      id: "1",
      isFollowing: true,
      followersCount: 3,
      username: "ada",
    });

    expect(
      updateFollowInData(
        { id: "1", isFollowing: true, followersCount: 0 },
        "1",
        false,
      ),
    ).toEqual({ id: "1", isFollowing: false, followersCount: 0 });
  });

  it("does not bump followersCount when the flag is already set", () => {
    expect(
      updateFollowInData(
        { id: "1", isFollowing: true, followersCount: 4 },
        "1",
        true,
      ),
    ).toEqual({ id: "1", isFollowing: true, followersCount: 4 });
  });

  it("sets isFollowing on nested post authors", () => {
    const next = updateFollowInData(
      {
        id: "post-1",
        author: { id: "u1", username: "ada", isFollowing: false },
        sharedPost: {
          id: "post-0",
          author: { id: "u1", username: "ada", isFollowing: false },
        },
        latestComment: {
          id: "c1",
          author: { id: "u2", username: "bob", isFollowing: false },
        },
      },
      "u1",
      true,
    );

    expect(next).toEqual({
      id: "post-1",
      author: { id: "u1", username: "ada", isFollowing: true },
      sharedPost: {
        id: "post-0",
        author: { id: "u1", username: "ada", isFollowing: true },
      },
      latestComment: {
        id: "c1",
        author: { id: "u2", username: "bob", isFollowing: false },
      },
    });
  });

  it("updates matching authors in a paginated response", () => {
    const next = updateFollowInData(
      {
        items: [
          { id: "p1", author: { id: "u1", isFollowing: false } },
          { id: "p2", author: { id: "u2", isFollowing: false } },
        ],
        meta: { total: 2 },
      },
      "u2",
      true,
    );

    expect(next).toEqual({
      items: [
        { id: "p1", author: { id: "u1", isFollowing: false } },
        { id: "p2", author: { id: "u2", isFollowing: true } },
      ],
      meta: { total: 2 },
    });
  });

  it("walks infinite query pages", () => {
    const next = updateFollowInData(
      {
        pages: [
          { items: [{ id: "p1", author: { id: "u1", isFollowing: false } }] },
          { items: [{ id: "p2", author: { id: "u2", isFollowing: false } }] },
        ],
        pageParams: [1, 2],
      },
      "u2",
      true,
    ) as {
      pages: Array<{
        items: Array<{ author: { isFollowing: boolean } }>;
      }>;
      pageParams: number[];
    };

    expect(next.pageParams).toEqual([1, 2]);
    expect(next.pages[1].items[0].author.isFollowing).toBe(true);
  });

  it("leaves unrelated objects unchanged", () => {
    const data = { id: "other", isFollowing: false, followersCount: 1 };
    expect(updateFollowInData(data, "1", true)).toBe(data);
  });
});
