import { describe, expect, it } from "vitest";
import { viewerFrom } from "./use-viewer";

const sessionUser = {
  id: "u1",
  username: "ada",
  displayName: "Ada",
  avatarUrl: "https://cdn.example/old.png",
};

const profile = {
  id: "u1",
  username: "ada",
  displayName: "Ada Lovelace",
  avatarUrl: "/api/media/new-id",
};

describe("viewerFrom", () => {
  it("prefers profile over the session snapshot", () => {
    expect(viewerFrom(profile, sessionUser)).toEqual({
      id: "u1",
      username: "ada",
      displayName: "Ada Lovelace",
      avatarUrl: "/api/media/new-id",
    });
  });

  it("keeps a cleared avatar from profile instead of the session photo", () => {
    expect(
      viewerFrom({ ...profile, avatarUrl: null }, sessionUser)?.avatarUrl,
    ).toBeNull();
  });

  it("falls back to the session user before myProfile lands", () => {
    expect(viewerFrom(undefined, sessionUser)).toEqual({
      id: "u1",
      username: "ada",
      displayName: "Ada",
      avatarUrl: "https://cdn.example/old.png",
    });
  });

  it("returns null when signed out", () => {
    expect(viewerFrom(undefined, null)).toBeNull();
  });
});
