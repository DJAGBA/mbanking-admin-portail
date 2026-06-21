'use client';
type PlanFiltersProps = {
  active: boolean | undefined
  onActiveChange: (value: boolean | undefined) => void
}
// Component for filtering plans by status (active/inactive/all)
export function PlanFilters({ active, onActiveChange }: PlanFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Statut :</span>
      <div className="flex gap-2">
        <button
          onClick={() => onActiveChange(undefined)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === undefined
              ? ' bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => onActiveChange(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === true
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
  );
}