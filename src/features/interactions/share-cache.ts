/**
 * Recursively traverses query cache data structures (single items,
 * paginated responses, infinite query pages) and marks a post as shared.
 */
export function updateShareInData(
  data: unknown,
  targetId: string,
): unknown {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;

  if ("id" in record && record.id === targetId && "sharesCount" in record) {
    const alreadyShared = Boolean(record.isShared);
    return {
      ...record,
      isShared: true,
      sharesCount: alreadyShared
        ? (record.sharesCount as number)
        : (record.sharesCount as number) + 1,
    };
  }

  if ("items" in record && Array.isArray(record.items)) {
    return {
      ...record,
      items: (record.items as unknown[]).map((item) =>
        updateShareInData(item, targetId),
      ),
    };
  }

  if ("pages" in record && Array.isArray(record.pages)) {
    return {
      ...record,
      pages: (record.pages as unknown[]).map((page) =>
        updateShareInData(page, targetId),
      ),
    };
  }

  return data;
}
