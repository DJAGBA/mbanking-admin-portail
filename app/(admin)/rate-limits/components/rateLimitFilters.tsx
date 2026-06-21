'use client';

import { useState } from 'react';
type RateLimitFiltersProps = {
  planName: string | undefined;
  active: boolean | undefined;
  onPlanNameChange: (value: string | undefined) => void;
  onActiveChange: (value: boolean | undefined) => void;
};
// Component for filtering rate limits by plan name and status (active/inactive/all)
export function RateLimitFilters({
  planName,
  active,
  onPlanNameChange,
  onActiveChange,
}: RateLimitFiltersProps) {
  const [planInput, setPlanInput] = useState(planName || '');
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* FILTRE PAR NOM DE PLAN */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Plan :
        </label>
        <input
          type="text"
          value={planInput}
          placeholder="ex: premium..."
          onChange={(e) => {
            setPlanInput(e.target.value);
            onPlanNameChange(e.target.value || undefined);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white w-40"
        />
      </div>
      {/* FILTRE PAR STATUT */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Statut</span>
        <div className="flex gap-2">
          <button
            onClick={() => onActiveChange(undefined)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border border-gray-200 ${
              active === undefined
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-white hover:bg-primary'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => onActiveChange(true)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border border-gray-200 ${
              active === true
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            Actifs
          </button>
          <button
          onClick={() => onActiveChange(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === false
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Inactifs
        </button>
        </div>
      </div>
    </div>
  );
}