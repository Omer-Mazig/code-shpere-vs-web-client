import { describe, expect, it } from "vitest";
import { updateLikeInData } from "./like-cache";

describe("updateLikeInData", () => {
  it("returns non-objects unchanged", () => {
    expect(updateLikeInData(null, "1", true, 1)).toBeNull();
    expect(updateLikeInData("post", "1", true, 1)).toBe("post");
  });

  it("updates a matching detail item and floors likesCount at 0", () => {
    expect(
      updateLikeInData(
        { id: "1", likesCount: 2, isLiked: false, title: "Hi" },
        "1",
        true,
        1,
      ),
    ).toEqual({ id: "1", likesCount: 3, isLiked: true, title: "Hi" });

    expect(
      updateLikeInData({ id: "1", likesCount: 0, isLiked: true }, "1", false, -1),
    ).toEqual({ id: "1", likesCount: 0, isLiked: false });
  });

  it("updates matching items in a paginated response", () => {
    const next = updateLikeInData(
      {
        items: [
          { id: "1", likesCount: 1, isLiked: false },
          { id: "2", likesCount: 4, isLiked: true },
        ],
        meta: { total: 2 },
      },
      "2",
      false,
      -1,
    );

    expect(next).toEqual({
      items: [
        { id: "1", likesCount: 1, isLiked: false },
        { id: "2", likesCount: 3, isLiked: false },
      ],
      meta: { total: 2 },
    });
  });

  it("walks infinite query pages", () => {
    const next = updateLikeInData(
      {
        pages: [
          { items: [{ id: "1", likesCount: 1, isLiked: false }] },
          { items: [{ id: "2", likesCount: 5, isLiked: false }] },
        ],
        pageParams: [1, 2],
      },
      "2",
      true,
      1,
    ) as {
      pages: Array<{ items: Array<{ id: string; likesCount: number }> }>;
      pageParams: number[];
    };

    expect(next.pageParams).toEqual([1, 2]);
    expect(next.pages[1].items[0].likesCount).toBe(6);
  });

  it("leaves unrelated objects unchanged", () => {
    const data = { id: "other", likesCount: 1, isLiked: false };
    expect(updateLikeInData(data, "1", true, 1)).toBe(data);
  });
});
