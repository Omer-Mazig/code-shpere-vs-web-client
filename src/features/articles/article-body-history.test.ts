import { describe, expect, it } from "vitest";
import {
  canRedoBody,
  canUndoBody,
  createBodyHistory,
  recordBodySnapshot,
  redoBody,
  undoBody,
} from "./article-body-history";

const snapshot = (value: string, cursor = value.length) => ({
  value,
  selectionStart: cursor,
  selectionEnd: cursor,
});

describe("createBodyHistory", () => {
  it("starts with nothing to undo or redo", () => {
    const history = createBodyHistory("draft");
    expect(canUndoBody(history)).toBe(false);
    expect(canRedoBody(history)).toBe(false);
    expect(history.present).toEqual(snapshot("draft"));
  });
});

describe("recordBodySnapshot", () => {
  it("adds one entry per discrete edit", () => {
    let history = createBodyHistory("a");
    history = recordBodySnapshot(history, snapshot("ab"));
    history = recordBodySnapshot(history, snapshot("abc"));

    expect(history.past.map((entry) => entry.value)).toEqual(["a", "ab"]);
    expect(history.present.value).toBe("abc");
  });

  it("coalesces a typing burst into the current entry", () => {
    let history = createBodyHistory("a");
    history = recordBodySnapshot(history, snapshot("ab"));
    history = recordBodySnapshot(history, snapshot("abc"), { coalesce: true });
    history = recordBodySnapshot(history, snapshot("abcd"), { coalesce: true });

    expect(history.past.map((entry) => entry.value)).toEqual(["a"]);
    expect(undoBody(history).present.value).toBe("a");
  });

  it("keeps the selection but adds no entry when the value is unchanged", () => {
    let history = createBodyHistory("hello");
    history = recordBodySnapshot(history, {
      value: "hello",
      selectionStart: 0,
      selectionEnd: 5,
    });

    expect(history.past).toEqual([]);
    expect(history.present.selectionEnd).toBe(5);
  });

  it("drops the redo stack once a new edit is recorded", () => {
    let history = createBodyHistory("a");
    history = recordBodySnapshot(history, snapshot("ab"));
    history = undoBody(history);
    expect(canRedoBody(history)).toBe(true);

    history = recordBodySnapshot(history, snapshot("ac"));
    expect(canRedoBody(history)).toBe(false);
  });

  it("caps how far back the stack goes", () => {
    let history = createBodyHistory("");
    for (let index = 0; index < 150; index += 1) {
      history = recordBodySnapshot(history, snapshot("x".repeat(index + 1)));
    }
    expect(history.past.length).toBe(100);
  });
});

describe("undoBody / redoBody", () => {
  it("restores the value and the caret", () => {
    let history = createBodyHistory("see here");
    history = recordBodySnapshot(history, snapshot("see ![alt](/api/media/1) here", 24));

    const undone = undoBody(history);
    expect(undone.present).toEqual(snapshot("see here"));

    const redone = redoBody(undone);
    expect(redone.present).toEqual(snapshot("see ![alt](/api/media/1) here", 24));
  });

  it("is a no-op at either end of the stack", () => {
    const history = createBodyHistory("only");
    expect(undoBody(history)).toBe(history);
    expect(redoBody(history)).toBe(history);
  });
});
