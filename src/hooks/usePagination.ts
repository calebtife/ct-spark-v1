import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
  siblingCount?: number;
}

interface PaginationRange {
  start: number;
  end: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize = 10,
  siblingCount = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / pageSize);

  const paginationRange = useMemo(() => {
    const range: PaginationRange = {
      start: Math.max(1, currentPage - siblingCount),
      end: Math.min(totalPages, currentPage + siblingCount),
    };

    // Adjust range if we're near the start or end
    if (range.start === 1) {
      range.end = Math.min(range.end + siblingCount, totalPages);
    }
    if (range.end === totalPages) {
      range.start = Math.max(1, range.start - siblingCount);
    }

    return range;
  }, [currentPage, totalPages, siblingCount]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const getPageItems = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    paginationRange,
    hasPreviousPage,
    hasNextPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageItems,
  };
} 