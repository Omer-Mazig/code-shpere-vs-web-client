export const ARTICLE_LIST_PAGE_SIZE = 9;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ArticleListFilters = {
  page: number;
  search?: string;
  topicId?: string;
  authorId?: string;
};

function optionalUuid(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  return UUID_RE.test(value) ? value : undefined;
}

export function parseArticleListSearchParams(
  searchParams: URLSearchParams,
): ArticleListFilters {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const search = searchParams.get("search")?.trim() || undefined;

  return {
    page,
    search,
    topicId: optionalUuid(searchParams.get("topicId")),
    authorId: optionalUuid(searchParams.get("authorId")),
  };
}

export function toArticleListSearchParams(
  filters: ArticleListFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.topicId) {
    params.set("topicId", filters.topicId);
  }
  if (filters.authorId) {
    params.set("authorId", filters.authorId);
  }
  return params;
}

export function articleListHref(filters: ArticleListFilters): string {
  const query = toArticleListSearchParams(filters).toString();
  return query ? `/articles?${query}` : "/articles";
}
