import { describe, expect, it } from "vitest";
import {
  getMentionContext,
  insertMention,
  tokenizeCommentMentions,
} from "./comment-mentions";

describe("getMentionContext", () => {
  it("detects an @query at the start of the text", () => {
    expect(getMentionContext("@ad", 3)).toEqual({
      start: 0,
      end: 3,
      query: "ad",
    });
  });

  it("detects an @query after whitespace", () => {
    expect(getMentionContext("hello @ada", 10)).toEqual({
      start: 6,
      end: 10,
      query: "ada",
    });
  });

  it("returns null when @ is mid-word or the cursor is not at the query end", () => {
    expect(getMentionContext("email@ada", 9)).toBeNull();
    expect(getMentionContext("hello @ada there", 16)).toBeNull();
    expect(getMentionContext("no mention", 10)).toBeNull();
  });

  it("allows an empty query right after @", () => {
    expect(getMentionContext("hi @", 4)).toEqual({
      start: 3,
      end: 4,
      query: "",
    });
  });
});

describe("insertMention", () => {
  it("replaces the query with @username and a trailing space", () => {
    expect(
      insertMention("hello @ad", { start: 6, end: 9, query: "ad" }, "ada"),
    ).toEqual({
      nextValue: "hello @ada ",
      nextCursor: 11,
    });
  });
});

describe("tokenizeCommentMentions", () => {
  const ada = { id: "u1", username: "Ada" };

  it("turns known mentions into mention tokens using stored username casing", () => {
    expect(
      tokenizeCommentMentions("hey @ada, nice", [ada]),
    ).toEqual([
      { type: "text", value: "hey " },
      { type: "mention", value: "@Ada", user: ada },
      { type: "text", value: ", nice" },
    ]);
  });

  it("leaves unknown @tokens as plain text", () => {
    expect(tokenizeCommentMentions("see @nobody", [ada])).toEqual([
      { type: "text", value: "see " },
      { type: "text", value: "@nobody" },
    ]);
  });

  it("does not treat short @xx fragments as mentions", () => {
    expect(tokenizeCommentMentions("hi @ab there", [ada])).toEqual([
      { type: "text", value: "hi @ab there" },
    ]);
  });
});
