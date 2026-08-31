import {
  buildNotificationPreferencesPatch,
  isNotificationPreferencesPatchEmpty,
} from "./build-notification-preferences-patch";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "./types";

export const NOTIFICATION_PREFERENCES_FLUSH_DEBOUNCE_MS = 200;

export function createNotificationPreferencesFlushController() {
  let lastConfirmed: NotificationPreferences | undefined;
  let inFlight = false;
  let queued = false;
  let debouncePending = false;

  return {
    seedIfEmpty(prefs: NotificationPreferences) {
      if (!lastConfirmed) {
        lastConfirmed = { ...prefs };
      }
    },

    setDebouncePending(value: boolean) {
      debouncePending = value;
    },

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

    onError(): NotificationPreferences | undefined {
      inFlight = false;
      queued = false;
      debouncePending = false;
      return lastConfirmed ? { ...lastConfirmed } : undefined;
    },
  };
}
