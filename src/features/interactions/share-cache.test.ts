import { describe, expect, it } from "vitest";
import { updateShareInData } from "./share-cache";

describe("updateShareInData", () => {
  it("increments sharesCount and marks isShared", () => {
    expect(
      updateShareInData(
        { id: "1", sharesCount: 2, isShared: false },
        "1",
      ),
    ).toEqual({ id: "1", sharesCount: 3, isShared: true });
  });

  it("does not increment when already shared", () => {
    expect(
      updateShareInData(
        { id: "1", sharesCount: 2, isShared: true },
        "1",
      ),
    ).toEqual({ id: "1", sharesCount: 2, isShared: true });
  });

  it("walks paginated and infinite query data", () => {
    const next = updateShareInData(
      {
        pages: [
          {
            items: [{ id: "1", sharesCount: 0, isShared: false }],
          },
        ],
      },
      "1",
    ) as {
      pages: Array<{
        items: Array<{ id: string; sharesCount: number; isShared: boolean }>;
      }>;
    };

    expect(next.pages[0].items[0]).toEqual({
      id: "1",
      sharesCount: 1,
      isShared: true,
    });
  });
});
