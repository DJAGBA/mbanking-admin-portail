'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly limit: number;
  readonly onPageChange: (page: number) => void;
  readonly onLimitChange: (limit: number) => void;
}
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (total === 0) return null;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Info résultats */}
      <div className="text-sm text-gray-600">
        Affichage de{' '}
        <span className="font-semibold">{startItem}</span> à{' '}
        <span className="font-semibold">{endItem}</span> sur{' '}
        <span className="font-semibold">{total}</span> résultats
      </div>
      <div className="flex items-center gap-4">
        {/* Sélecteur limite */}
        <div className="flex items-center gap-2">
          <label htmlFor="pagination-limit" className="text-sm font-medium text-gray-700">
            Par page :
          </label>
          <select
            id="pagination-limit"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {[10, 20, 50, 100].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        
        {/* Navigation pages */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          >
            <span className="hidden sm:inline">← Précédent</span>
            <ChevronLeft className="w-4 h-4 sm:hidden" />
          </button>

          <span className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg">
            Page <span className="font-semibold">{page}</span> sur{' '}
            <span className="font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Page suivante"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          >
            <span className="hidden sm:inline">Suivant →</span>
            <ChevronRight className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </div>
    </nav>
  );
}