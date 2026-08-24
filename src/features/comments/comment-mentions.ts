export type MentionContext = {
  start: number;
  end: number;
  query: string;
};

export type MentionUser = {
  id: string;
  username: string;
};

export type CommentMentionToken =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; user: MentionUser };

const COMMENT_MENTION_REGEX = /(@[a-zA-Z0-9_-]{3,30})/g;

export function getMentionContext(
  value: string,
  cursorPosition: number,
): MentionContext | null {
  const beforeCursor = value.slice(0, cursorPosition);
  const match = /(^|\s)@([a-zA-Z0-9_-]*)$/.exec(beforeCursor);
  if (!match) return null;

  const query = match[2] ?? "";
  const end = cursorPosition;
  const start = end - query.length - 1;
  if (start < 0) return null;

  return { start, end, query };
}

export function insertMention(
  value: string,
  context: MentionContext,
  username: string,
): { nextValue: string; nextCursor: number } {
  const mentionToken = `@${username} `;
  const nextValue =
    value.slice(0, context.start) + mentionToken + value.slice(context.end);
  const nextCursor = context.start + mentionToken.length;

  return { nextValue, nextCursor };
}

export function tokenizeCommentMentions(
  content: string,
  mentionedUsers: MentionUser[],
): CommentMentionToken[] {
  const mentionMap = new Map(
    mentionedUsers.map((user) => [user.username.toLowerCase(), user]),
  );
  const parts = content.split(COMMENT_MENTION_REGEX);

  const tokens = parts.map((part) => {
    const mentionMatch = /^@([a-zA-Z0-9_-]{3,30})$/.exec(part);
    if (!mentionMatch) {
      return { type: "text" as const, value: part };
    }

    const username = mentionMatch[1].toLowerCase();
    const mentionedUser = mentionMap.get(username);
    if (!mentionedUser) {
      return { type: "text" as const, value: part };
    }

    return {
      type: "mention" as const,
      value: `@${mentionedUser.username}`,
      user: mentionedUser,
    };
  });

  return tokens.filter((token) => token.type !== "text" || token.value !== "");
}
