export const TYPING_COALESCE_MS = 300;

const HISTORY_LIMIT = 100;

export type BodySnapshot = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type BodyHistory = {
  past: BodySnapshot[];
  present: BodySnapshot;
  future: BodySnapshot[];
};

export function createBodyHistory(value: string): BodyHistory {
  return {
    past: [],
    present: {
      value,
      selectionStart: value.length,
      selectionEnd: value.length,
    },
    future: [],
  };
}

/**
 * `coalesce` merges the edit into the current entry instead of adding one, so a
 * burst of keystrokes undoes as a single step.
 */
export function recordBodySnapshot(
  history: BodyHistory,
  snapshot: BodySnapshot,
  { coalesce = false }: { coalesce?: boolean } = {},
): BodyHistory {
  if (snapshot.value === history.present.value) {
    return { ...history, present: snapshot };
  }

  if (coalesce) {
    return { past: history.past, present: snapshot, future: [] };
  }

  const past = [...history.past, history.present];
  return {
    past: past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past,
    present: snapshot,
    future: [],
  };
}

export function undoBody(history: BodyHistory): BodyHistory {
  const previous = history.past.at(-1);
  if (!previous) {
    return history;
  }
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoBody(history: BodyHistory): BodyHistory {
  const [next, ...future] = history.future;
  if (!next) {
    return history;
  }
  return {
    past: [...history.past, history.present],
    present: next,
    future,
  };
}

export function canUndoBody(history: BodyHistory): boolean {
  return history.past.length > 0;
}

export function canRedoBody(history: BodyHistory): boolean {
  return history.future.length > 0;
}
