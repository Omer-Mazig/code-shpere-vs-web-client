/**
 * Recursively traverses query cache data structures (single items,
 * paginated responses, infinite query pages) and toggles the like
 * state for the item matching `targetId`.
 */
export function updateLikeInData(
  data: unknown,
  targetId: string,
  isLiked: boolean,
  delta: number,
): unknown {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;

  if ("id" in record && record.id === targetId && "likesCount" in record) {
    return {
      ...record,
      isLiked,
      likesCount: Math.max(0, (record.likesCount as number) + delta),
    };
  }

  if ("items" in record && Array.isArray(record.items)) {
    return {
      ...record,
      items: (record.items as Record<string, unknown>[]).map((item) =>
        item.id === targetId && "likesCount" in item
          ? {
              ...item,
              isLiked,
              likesCount: Math.max(0, (item.likesCount as number) + delta),
            }
          : item,
      ),
    };
  }

  if ("pages" in record && Array.isArray(record.pages)) {
    return {
      ...record,
      pages: (record.pages as unknown[]).map((page) =>
        updateLikeInData(page, targetId, isLiked, delta),
      ),
    };
  }

  return data;
}
