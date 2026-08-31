import {
  buildNotificationPreferencesPatch,
  isNotificationPreferencesPatchEmpty,
} from "./build-notification-preferences-patch";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "./types";

/**
 * Quiet window after a toggle before we talk to the server.
 * Rapid off→on of the same switch nets out to an empty PATCH.
 */
export const NOTIFICATION_PREFERENCES_FLUSH_DEBOUNCE_MS = 200;

/**
 * Serializes notification-preference PATCHes so switches can stay optimistic
 * without lying.
 *
 * The four switches share one DB row, and the API is a read-modify-write
 * merge. Two overlapping PATCHes (`{ likes: false }` then `{ mentions: false }`)
 * can persist the wrong document. The like button avoids this because each
 * like is its own row; we cannot copy that pattern here.
 *
 * This controller never touches React Query. The hook owns the cache (user
 * intent) and the network. We only decide:
 * - whether a flush should fire, and with which diff
 * - whether a server payload is still the latest intent
 * - what to roll back to when a write fails
 *
 * State:
 * - `lastConfirmed` — last payload the server accepted
 * - `inFlight` — one PATCH at a time
 * - `queued` — a flush was requested while a PATCH was already in flight
 * - `debouncePending` — a newer toggle has not been flushed yet
 */
export function createNotificationPreferencesFlushController() {
  let lastConfirmed: NotificationPreferences | undefined;
  let inFlight = false;
  let queued = false;
  let debouncePending = false;

  return {
    /**
     * Snapshot the current cache as `lastConfirmed` on the first toggle so
     * later diffs are against the last known server truth, not against an
     * already-optimistic cache.
     */
    seedIfEmpty(prefs: NotificationPreferences) {
      if (!lastConfirmed) {
        lastConfirmed = { ...prefs };
      }
    },

    /**
     * The hook sets this while a debounce timer is armed. A success that
     * lands in that window must not overwrite the cache — the user has a
     * newer intent that has not been sent yet.
     */
    setDebouncePending(value: boolean) {
      debouncePending = value;
    },

    /**
     * Decide whether to send a PATCH for `cache` (the current UI).
     *
     * - Already in flight → remember that another flush is needed, send nothing.
     * - Cache matches `lastConfirmed` → send nothing (revert during debounce).
     * - Otherwise → mark in flight and return the dirty keys only.
     *
     * @returns The PATCH body, or `null` if this call should not hit the network.
     */
    beginFlush(
      cache: NotificationPreferences,
    ): UpdateNotificationPreferencesDto | null {
      if (inFlight) {
        queued = true;
        return null;
      }

      if (!lastConfirmed) {
        lastConfirmed = { ...cache };
      }

      const dto = buildNotificationPreferencesPatch(cache, lastConfirmed);
      if (isNotificationPreferencesPatchEmpty(dto)) {
        return null;
      }

      inFlight = true;
      return dto;
    },

    /**
     * Record the server snapshot, then say whether the hook should trust it.
     *
     * Always update `lastConfirmed` so a queued follow-up diffs against what
     * the server actually has (e.g. in-flight `{ likes: false }`, user flips
     * likes back on → next PATCH is `{ likes: true }`).
     *
     * Do **not** apply that snapshot to the cache if `queued` or
     * `debouncePending` — that would flash a stale value over a newer toggle.
     *
     * @returns `applyServerToCache` if the hook should write `server` into
     *   React Query; `shouldFlushAgain` if a toggle arrived while this PATCH
     *   was in flight and its debounce already fired.
     */
    onSuccess(server: NotificationPreferences): {
      applyServerToCache: boolean;
      shouldFlushAgain: boolean;
    } {
      lastConfirmed = { ...server };
      inFlight = false;
      const applyServerToCache = !queued && !debouncePending;
      const shouldFlushAgain = queued;
      queued = false;
      return { applyServerToCache, shouldFlushAgain };
    },

    /**
     * Drop queued/debounced work and return `lastConfirmed` so the hook can
     * snap the cache back. The failed write never landed, so any optimistic
     * toggles — including ones not in that PATCH — are no longer honest.
     *
     * @returns The last server-confirmed prefs, or `undefined` if none.
     */
    onError(): NotificationPreferences | undefined {
      inFlight = false;
      queued = false;
      debouncePending = false;
      return lastConfirmed ? { ...lastConfirmed } : undefined;
    },
  };
}
