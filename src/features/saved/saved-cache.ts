export function updateSavedInData(
  data: unknown,
  targetId: string,
  isSaved: boolean,
): unknown {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;

  if ("id" in record && record.id === targetId && "isSaved" in record) {
    return { ...record, isSaved };
  }

  if ("items" in record && Array.isArray(record.items)) {
    return {
      ...record,
      items: record.items.map((item) =>
        updateSavedInData(item, targetId, isSaved),
      ),
    };
  }

  if ("pages" in record && Array.isArray(record.pages)) {
    return {
      ...record,
      pages: record.pages.map((page) =>
        updateSavedInData(page, targetId, isSaved),
      ),
    };
  }

  return data;
}
