import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import {
  createNotificationPreferencesFlushController,
  NOTIFICATION_PREFERENCES_FLUSH_DEBOUNCE_MS,
} from "../notification-preferences-flush";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey =
    usersQueryOptionsFactory.notificationPreferences().queryKey;
  const controllerRef = useRef(createNotificationPreferencesFlushController());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runFlushRef = useRef<() => void>(() => {});

  const mutation = useMutation({
    mutationKey: ["users", "updateNotificationPreferences"],
    mutationFn: (dto: UpdateNotificationPreferencesDto) =>
      usersApi.updateNotificationPreferences(dto),
  });

  runFlushRef.current = () => {
    const cache = queryClient.getQueryData<NotificationPreferences>(queryKey);
    if (!cache) {
      return;
    }

    const dto = controllerRef.current.beginFlush(cache);
    if (!dto) {
      return;
    }

    void mutation.mutateAsync(dto).then(
      (prefs) => {
        const { applyServerToCache, shouldFlushAgain } =
          controllerRef.current.onSuccess(prefs);
        if (applyServerToCache) {
          queryClient.setQueryData(queryKey, prefs);
        }
        if (shouldFlushAgain) {
          runFlushRef.current();
        }
      },
      (error: unknown) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        const confirmed = controllerRef.current.onError();
        if (confirmed) {
          queryClient.setQueryData(queryKey, confirmed);
        }
        toast.error(
          getApiError(error).message ?? "Could not update notifications.",
        );
      },
    );
  };

  const scheduleFlush = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    controllerRef.current.setDebouncePending(true);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      controllerRef.current.setDebouncePending(false);
      runFlushRef.current();
    }, NOTIFICATION_PREFERENCES_FLUSH_DEBOUNCE_MS);
  };

  const mutate = (dto: UpdateNotificationPreferencesDto) => {
    const current = queryClient.getQueryData<NotificationPreferences>(queryKey);
    if (!current) {
      return;
    }

    controllerRef.current.seedIfEmpty(current);
    queryClient.setQueryData<NotificationPreferences>(queryKey, {
      ...current,
      ...dto,
    });
    void queryClient.cancelQueries({ queryKey });
    scheduleFlush();
  };

  useEffect(() => {
    return () => {
      if (!debounceTimerRef.current) {
        return;
      }
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      controllerRef.current.setDebouncePending(false);
      runFlushRef.current();
    };
  }, []);

  return { mutate };
}
