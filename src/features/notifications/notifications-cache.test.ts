import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/types";
import type { Notification } from "./types";
import {
  markAllNotificationsReadInList,
  markNotificationReadInList,
  upsertNotificationInList,
} from "./notifications-cache";

const READ_AT = "2026-08-24T12:00:00.000Z";

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n1",
    type: "POST_LIKED",
    targetType: "POST",
    payload: {
      type: "POST_LIKED",
      actorId: "actor-1",
      actorName: "Ada",
      actorAvatarUrl: null,
      targetType: "POST",
      postId: "post-1",
      postExcerpt: "hello",
      createdAt: "2026-08-01T00:00:00.000Z",
    },
    isRead: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    readAt: null,
    ...overrides,
  };
}

function list(
  items: Notification[],
  total = items.length,
): InfiniteData<PaginatedResponse<Notification>> {
  return {
    pageParams: [1],
    pages: [
      {
        items,
        meta: {
          total,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    ],
  };
}

describe("upsertNotificationInList", () => {
  it("returns the original cache when there are no pages", () => {
    expect(upsertNotificationInList(undefined, notification())).toBeUndefined();
    const empty = { pages: [], pageParams: [] };
    expect(upsertNotificationInList(empty, notification())).toBe(empty);
  });

  it("replaces an existing notification and moves it to the front", () => {
    const existing = notification({ payload: {
      ...notification().payload,
      actorName: "Ada",
    }});
    const older = notification({ id: "n-old" });
    const old = list([older, existing]);
    const incoming = notification({
      payload: {
        ...existing.payload,
        actorName: "Bob",
        actorCount: 2,
      },
      updatedAt: "2026-08-02T00:00:00.000Z",
    });

    const next = upsertNotificationInList(old, incoming);

    expect(next?.pages[0].items.map((item) => item.id)).toEqual([
      "n1",
      "n-old",
    ]);
    expect(next?.pages[0].items[0].payload.actorName).toBe("Bob");
    expect(next?.pages[0].meta.total).toBe(2);
  });

  it("prepends a new notification and increments total", () => {
    const old = list([notification({ id: "n-old" })], 1);
    const incoming = notification({ id: "n-new" });

    const next = upsertNotificationInList(old, incoming);

    expect(next?.pages[0].items.map((item) => item.id)).toEqual([
      "n-new",
      "n-old",
    ]);
    expect(next?.pages[0].meta.total).toBe(2);
  });
});

describe("markNotificationReadInList", () => {
  it("marks the matching item read and keeps an existing readAt", () => {
    const alreadyRead = notification({
      id: "n-read",
      isRead: true,
      readAt: "2026-01-01T00:00:00.000Z",
    });
    const unread = notification({ id: "n-unread" });
    const old = {
      pageParams: [1, 2],
      pages: [
        list([unread]).pages[0],
        list([alreadyRead]).pages[0],
      ],
    };

    const next = markNotificationReadInList(old, "n-unread", READ_AT);

    expect(next?.pages[0].items[0]).toEqual({
      ...unread,
      isRead: true,
      readAt: READ_AT,
    });
    expect(next?.pages[1].items[0].readAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("markAllNotificationsReadInList", () => {
  it("marks only unread items and stamps a shared readAt", () => {
    const read = notification({
      id: "n-read",
      isRead: true,
      readAt: "2026-01-01T00:00:00.000Z",
    });
    const unread = notification({ id: "n-unread" });
    const old = list([read, unread]);

    const next = markAllNotificationsReadInList(old, READ_AT);

    expect(next?.pages[0].items[0]).toBe(read);
    expect(next?.pages[0].items[1]).toEqual({
      ...unread,
      isRead: true,
      readAt: READ_AT,
    });
  });
});
