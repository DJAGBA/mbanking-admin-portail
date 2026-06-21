'use client';

import { RateLimitHistory } from '@/src/types/rate-limit';

type historyTableProps = {
  history: RateLimitHistory[]
}

const actionLabels = {
  created: { label: 'Créé', color: 'bg-green-100 text-green-700' },
  updated: { label: 'Modifié', color: 'bg-primary text-white' },
  expired: { label: 'Expiré', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
}

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateString?: string) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Traduction simple des notes connues
function translateNotes(notes?: string) {
  if (!notes) return '—';
  switch (notes) {
    case 'After contract renewal':
      return 'Après renouvellement du contrat';
    default:
      return notes; 
  }
}

// Component to display the history of actions performed on a rate limit plan in a table format
export function HistoryTable({ history }: historyTableProps) {
  if (history.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">Aucun historique disponible</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Action
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Plan
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Notes
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {history.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">

            {/* Colonne : Action */}
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                actionLabels[item.action]?.color || 'bg-gray-100 text-gray-700'
              }`}>
                {actionLabels[item.action]?.label || item.action}
              </span>
            </td>

            {/* Colonne : Plan */}
            <td className="px-6 py-4">
              <span className="text-sm font-mono font-medium text-gray-900">
                {item.planName}
              </span>
            </td>

            {/* Colonne : Notes (traduite) */}
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600">
                {translateNotes(item.notes)}
              </span>
            </td>
          <td className="px-6 py-4">
  <div className="flex flex-col">
    <span className="text-sm text-gray-900 whitespace-nowrap">
      {item.changedAt ? formatDate(String(item.changedAt)) : '—'}
    </span>
    <span className="text-xs text-gray-400 mt-0.5">
      {item.changedAt && formatTime(String(item.changedAt)) ? `à ${formatTime(String(item.changedAt))}` : ''}
    </span>
  </div>
</td>


          </tr>
        ))}
      </tbody>
    </table>
  );
}
