import { describe, expect, it } from "vitest";
import { truncateText } from "./utils";

describe("truncateText", () => {
  it("returns the original string when it fits", () => {
    expect(truncateText("hello", 5)).toBe("hello");
    expect(truncateText("hi", 5)).toBe("hi");
  });

  it("trims trailing spaces before appending an ellipsis", () => {
    expect(truncateText("hello world", 8)).toBe("hello wo...");
    expect(truncateText("hello   extra", 8)).toBe("hello...");
  });
});
