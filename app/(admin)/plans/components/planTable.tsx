'use client';

import React from 'react';
import { Plan } from '@/src/types/plan';
import { Eye, Pencil, CheckCircle, XCircle,ClipboardList} from 'lucide-react';

interface PlanTableProps {
  readonly plans: readonly Plan[];
  readonly onEdit: (plan: Plan) => void;
  readonly onDetail?: (plan: Plan) => void;
  readonly onToggleStatus: (plan: Plan) => void; 
  readonly onAssign: (plan: Plan) => void; 
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant?: 'blue' | 'green' | 'red' | 'gray' | 'amber';
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
    blue: 'text-primary hover:bg-primary/10',
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    gray: 'text-gray-500 hover:bg-gray-100',
    amber: 'text-amber-600 hover:bg-amber-50',
  };

  return (
    <div className="relative group/btn">
      <button 
        onClick={onClick}
        className={`p-2 rounded-lg transition-all ${variants[variant]}`}
        aria-label={label}
      >
        <Icon className="w-5 h-5" />
      </button>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block 
       bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg 
        whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </div>
  );
};

export function PlanTable({ plans = [], onEdit, onDetail, onToggleStatus, onAssign }: PlanTableProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        Aucun plan trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Nom</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Nom d&apos;affichage</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Quota/min</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Quota/heure</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Quota/jour</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900">Statut</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900 hidden md:table-cell">Créé le</th>
            <th scope="col" className="px-4 py-2.5 font-semibold text-gray-900 hidden md:table-cell">Modifié le</th>
            <th scope="col" className="px-4 py-2.5 pr-6 font-semibold text-gray-900 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {plans.map((plan) => (
            <tr  key={`${plan.id}-${plan.active}`} className="hover:bg-gray-50/80 transition-colors group">
              <td className="px-4 py-2.5">
                <span className="font-mono font-medium text-gray-900">{plan.name}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="font-medium text-gray-900">{plan.displayName}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-gray-700">{plan.pointsPerMinute ?? '—'}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-gray-700">{plan.pointsPerHour ?? '—'}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-gray-700">
                  {plan.pointsPerDay != null ? plan.pointsPerDay.toLocaleString() : '—'}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge active={plan.active} />
              </td>
              
              {/* Colonne : Créé le (Date + Heure en dessous) */}
              <td className="px-4 py-2.5 hidden md:table-cell">
                {plan.createdAt ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                      {new Date(plan.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                      à {new Date(plan.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">—</span>
                )}
              </td>

              {/* Colonne : Modifié le (Date + Heure en dessous) */}
              <td className="px-4 py-2.5 hidden md:table-cell">
                {plan.updatedAt ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                      {new Date(plan.updatedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                      à {new Date(plan.updatedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">—</span>
                )}
              </td>

              <td className="px-4 py-2.5 pr-6">
                <div className="flex justify-end items-center gap-1">
                  <ActionButton
                    icon={Eye}
                    label="Voir détails"
                    onClick={() => onDetail?.(plan)}
                  />
                  <ActionButton
                    icon={Pencil}
                    label="Modifier"
                    variant="blue"
                    onClick={() => onEdit(plan)}
                  />
                   <ActionButton
                     icon={ClipboardList}
                     label="Affecter un plan"
                     variant="amber"
                     onClick={() => onAssign(plan)}
                  />
                  <ActionButton
                    icon={plan.active ? XCircle : CheckCircle}
                    label={plan.active ? "Désactiver le plan" : "Activer le plan"}
                    variant={plan.active ? "red" : "green"}
                    onClick={() => onToggleStatus(plan)}
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