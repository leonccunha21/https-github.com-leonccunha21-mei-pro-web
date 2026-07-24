import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>
          Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de <strong>{totalItems}</strong>
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}/pág</option>
            ))}
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getVisiblePages().map((page, idx) =>
            typeof page === 'string' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
