/** Shared helper for TanStack Form + shadcn Field invalid state. */
export function isFieldInvalid(field: {
  state: {
    meta: {
      isTouched: boolean;
      isValid: boolean;
      errorMap?: { onServer?: unknown };
    };
  };
}): boolean {
  const hasServerError = Boolean(field.state.meta.errorMap?.onServer);
  return (field.state.meta.isTouched || hasServerError) && !field.state.meta.isValid;
}

/**
 * Maps API `details` onto matching TanStack Form fields (`errorMap.onServer`).
 * Returns true when at least one field was updated.
 */
export function applyApiFieldErrors(
  form: object,
  details: Array<{ field: string; message: string }> | undefined,
): boolean {
  if (!details?.length) {
    return false;
  }

  const api = form as {
    getFieldMeta: (name: string) => unknown;
    setFieldMeta: (
      name: string,
      updater: (prev: {
        errorMap?: Record<string, unknown>;
        isTouched?: boolean;
      }) => {
        errorMap?: Record<string, unknown>;
        isTouched?: boolean;
      },
    ) => void;
  };

  const byField = new Map<string, Array<{ message: string }>>();
  for (const { field, message } of details) {
    if (api.getFieldMeta(field) === undefined) {
      continue;
    }
    const existing = byField.get(field) ?? [];
    existing.push({ message });
    byField.set(field, existing);
  }

  if (byField.size === 0) {
    return false;
  }

  for (const [field, errors] of byField) {
    api.setFieldMeta(field, (prev) => ({
      ...prev,
      isTouched: true,
      errorMap: {
        ...prev.errorMap,
        onServer: errors.length === 1 ? errors[0] : errors,
      },
    }));
  }

  return true;
}

