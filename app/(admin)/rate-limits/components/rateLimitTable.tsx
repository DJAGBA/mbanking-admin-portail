'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RateLimit } from '@/src/types/rate-limit';
import { Eye, Pencil, XCircle, CheckCircle } from 'lucide-react';
interface RateLimitTableProps {
  readonly rateLimits: RateLimit[];
  readonly onDeactivate: (userId: string) => void;
  readonly onEdit?: (userId: string) => void;
  readonly onDetail?: (userId: string) => void;
}
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant?: 'blue' | 'red' | 'green' | 'amber';
}

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
    active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-600' : 'bg-red-600'}`} />
    {active ? 'Actif' : 'Inactif'}
  </span>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = 'blue' }: ActionButtonProps) => {
  const variants = {
    blue: 'text-blue-900 hover:bg-blue-50',
    red: 'text-red-600 hover:bg-red-50',
    green: 'text-green-600 hover:bg-green-50',
    amber: 'text-amber-600 hover:bg-amber-50',
  };

  return (
    <div className="relative group/btn">
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all ${variants[variant]}`}
        aria-label={label}
      >
        <Icon className="w-6 h-6" />
      </button>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block 
                       bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg 
                       whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </div>
  );
};

export function RateLimitTable({ rateLimits, onDeactivate, onEdit, onDetail }: RateLimitTableProps) {
  const router = useRouter();

  if (rateLimits.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        Aucune affectation trouvée
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-900">Utilisateur lié</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Plan attribué</th>
            <th className="px-6 py-4 font-semibold text-gray-900 hidden md:table-cell">Date de fin</th>
            <th className="px-6 py-4 font-semibold text-gray-900">Statut</th>
            <th className="px-6 py-4 pr-8 font-semibold text-gray-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rateLimits.map((item) => (
            <tr key={item.userId} className="hover:bg-gray-50/80 transition-colors group">
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">{item.username || 'Utilisateur inconnu'}</p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900 uppercase text-sm tracking-wider">{item.planDisplayName}</p>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <div className="flex flex-col text-sm text-gray-500 font-mono whitespace-nowrap">
                  <span>
                    {item.endDate
                      ? new Date(item.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : 'Permanent'}
                  </span>
                  <span>
                    {item.endDate
                      ? (() => {
                          const d = new Date(item.endDate);
                          const h = d.getHours();
                          const m = d.getMinutes();
                          return h || m
                            ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            : '23:59';
                        })()
                      : ''}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge active={item.active} />
              </td>
              <td className="px-6 py-4 pr-8">
                <div className="flex justify-end items-center gap-1">
                  <ActionButton
                    icon={Eye}
                    label="Voir détails"
                    onClick={() => onDetail?.(String(item.userId))}
                  />
                  <ActionButton
                    icon={Pencil}
                    label="Modifier limites"
                    variant="blue"
                    onClick={() => onEdit?.(String(item.userId))}
                  />
                  <ActionButton
                    icon={item.active ? XCircle : CheckCircle}
                    label={item.active ? "Désactiver" : "Activer"}
                    variant={item.active ? "red" : "green"}
                    onClick={() => onDeactivate(String(item.userId))}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}