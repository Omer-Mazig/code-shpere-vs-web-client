/**
 * Recursively traverses query cache data structures (single items,
 * paginated responses, infinite query pages) and updates follow state
 * for the user matching `targetUserId`.
 */
export function updateFollowInData(
  data: unknown,
  targetUserId: string,
  isFollowing: boolean,
): unknown {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;

  if ("pages" in record && Array.isArray(record.pages)) {
    return {
      ...record,
      pages: record.pages.map((page) =>
        updateFollowInData(page, targetUserId, isFollowing),
      ),
    };
  }

  if ("items" in record && Array.isArray(record.items)) {
    return {
      ...record,
      items: record.items.map((item) =>
        updateFollowInData(item, targetUserId, isFollowing),
      ),
    };
  }

  if (record.id === targetUserId && "isFollowing" in record) {
    const next: Record<string, unknown> = { ...record, isFollowing };
    if (
      typeof record.followersCount === "number" &&
      record.isFollowing !== isFollowing
    ) {
      next.followersCount = Math.max(
        0,
        record.followersCount + (isFollowing ? 1 : -1),
      );
    }
    return next;
  }

  let next = record;
  let changed = false;

  if ("author" in record) {
    const author = updateFollowAuthor(record.author, targetUserId, isFollowing);
    if (author !== record.author) {
      next = { ...next, author };
      changed = true;
    }
  }

  if (record.sharedPost) {
    const sharedPost = updateFollowInData(
      record.sharedPost,
      targetUserId,
      isFollowing,
    );
    if (sharedPost !== record.sharedPost) {
      next = changed ? next : { ...record };
      next = { ...next, sharedPost };
      changed = true;
    }
  }

  if (record.latestComment) {
    const latestComment = updateFollowInData(
      record.latestComment,
      targetUserId,
      isFollowing,
    );
    if (latestComment !== record.latestComment) {
      next = changed ? next : { ...record };
      next = { ...next, latestComment };
      changed = true;
    }
  }

  return changed ? next : data;
}

function updateFollowAuthor(
  author: unknown,
  targetUserId: string,
  isFollowing: boolean,
): unknown {
  if (!author || typeof author !== "object") return author;

  const record = author as Record<string, unknown>;
  if (record.id !== targetUserId) return author;

  return { ...record, isFollowing };
}
