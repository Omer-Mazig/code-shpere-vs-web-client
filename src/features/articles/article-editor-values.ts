export type ArticleEditorValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  topicIds: string[];
};

const sameTopics = (current: string[], saved: string[]) => {
  if (current.length !== saved.length) {
    return false;
  }
  const left = [...current].sort();
  const right = [...saved].sort();
  return left.every((topicId, index) => topicId === right[index]);
};

export function hasArticleEditorChanges(
  current: ArticleEditorValues,
  saved: ArticleEditorValues,
): boolean {
  return (
    current.title !== saved.title ||
    current.body !== saved.body ||
    current.coverImageUrl !== saved.coverImageUrl ||
    !sameTopics(current.topicIds, saved.topicIds)
  );
}
