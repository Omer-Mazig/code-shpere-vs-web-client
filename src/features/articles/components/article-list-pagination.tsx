import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { paginationItems } from "../pagination-items";

type ArticleListPaginationProps = {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  pageHref: (page: number) => string;
  onPageChange: (page: number) => void;
};

export const ArticleListPagination = ({
  page,
  totalPages,
  hasNextPage,
  pageHref,
  onPageChange,
}: ArticleListPaginationProps) => {
  const items = paginationItems(page, totalPages);
  if (items.length === 0) {
    return null;
  }

  const goTo = (
    event: MouseEvent<HTMLAnchorElement>,
    nextPage: number,
    enabled: boolean,
  ) => {
    if (
      !enabled ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onPageChange(nextPage);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? pageHref(page - 1) : undefined}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => goTo(event, page - 1, page > 1)}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={pageHref(item)}
                isActive={item === page}
                onClick={(event) => goTo(event, item, true)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={hasNextPage ? pageHref(page + 1) : undefined}
            aria-disabled={!hasNextPage}
            tabIndex={!hasNextPage ? -1 : undefined}
            className={
              !hasNextPage ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(event) => goTo(event, page + 1, hasNextPage)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
