'use client';

import React from 'react';
import { Bank } from '@/src/types/bank';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface BankTableProps {
  readonly banks: Bank[];
  readonly onEdit: (bank: Bank) => void;
  readonly onDelete: (id: string) => void;
}
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant?: 'blue' | 'green' | 'red';
}
// Component to display a table of partner banks with their details and actions (view details, edit, delete)
const ActionButton = ({ onClick, icon: Icon, label, variant = 'blue' }: ActionButtonProps) => {
  const variants = {
    blue: 'text-primary hover:bg-primary', 
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
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
// Main component to display a table of partner banks with their details and actions (view details, edit, delete)
export function BankTable({ banks, onEdit, onDelete }: BankTableProps) {
  const router = useRouter();
  if (banks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        Aucune banque trouvée
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left bg-white border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Banque</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Alias</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Identifiant</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Version</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Services</th>
            <th scope="col" className="px-3 py-4 text-right font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {banks.map((bank) => (
            <tr key={bank.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-3 py-4">
                <p className="font-medium text-gray-900">{bank.bankName}</p>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono text-sm text-gray-600">{bank.bankAlias}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600">{bank.bankUsername}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600">{bank.version || '—'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                  {bank.services?.length || 0} service(s)
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end items-center gap-1">
                  <ActionButton
                    icon={Eye}
                    label="Voir détails"
                    onClick={() => router.push(`/banks/${bank.id}`)}
                  />
                  <ActionButton
                    icon={Pencil}
                    label="Modifier"
                    variant="blue"
                    onClick={() => onEdit(bank)}
                  />
                  <ActionButton
                    icon={Trash2}
                    label="Supprimer"
                    variant="red"
                    onClick={() => onDelete(String(bank.id))}
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