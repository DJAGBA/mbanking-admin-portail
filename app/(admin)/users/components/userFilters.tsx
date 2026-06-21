'use client';

import React from 'react';
interface UserFiltersProps {
  readonly search: string; 
  readonly active?: boolean;
  readonly onSearchChange: (value: string) => void; 
  readonly onActiveChange: (active?: boolean) => void;
}
// Define filter options with their respective styles
const FILTER_OPTIONS = [
  { 
    label: 'Tous', 
    value: undefined, 
    activeClass: 'bg-primary text-white shadow-sm',
    inactiveClass: 'text-gray-600 hover:text-primary hover:bg-primary/10'
  },
  { 
    label: 'Actifs', 
    value: true, 
    activeClass: 'bg-green-600 text-white shadow-sm',
    inactiveClass: 'text-gray-600 hover:text-green-600 hover:bg-green-50'
  },
  { 
    label: 'Inactifs', 
    value: false, 
    activeClass: 'bg-red-600 text-white shadow-sm',
    inactiveClass: 'text-gray-600 hover:text-red-600 hover:bg-red-50'
  },
] as const;
// Component for user filters
export function UserFilters({
  active,
  onActiveChange,
}: UserFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500">Statut</span>
      <div className="flex gap-2" role="group">
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = active === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onActiveChange(opt.value)}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-lg 
                transition-all duration-200
                outline-none
                ${isSelected ? opt.activeClass : opt.inactiveClass}
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}