'use client';

import React from 'react';
import { UserData } from '@/src/types/user';
import { Pencil, XCircle, CheckCircle, RotateCcw, Trash2, Lock, Eye } from 'lucide-react';

interface UserTableProps {
  readonly users: UserData[];
  readonly onEdit: (user: UserData) => void;
  readonly onActivate?: (id: string) => void;
  readonly onDeactivate?: (id: string) => void;
  readonly onResetPassword?: (id: string) => void;
  readonly onRevokeToken?: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onDetail?: (user: UserData) => void;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant?: 'blue' | 'red' | 'purple' | 'yellow' | 'green';
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
    red: 'text-red-600 hover:bg-red-50',
    purple: 'text-purple-600 hover:bg-purple-50',
    yellow: 'text-yellow-600 hover:bg-yellow-50',
    green: 'text-green-600 hover:bg-green-50',
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

export function UserTable({
  users, onEdit, onActivate, onDeactivate, onResetPassword, onRevokeToken, onDelete, onDetail
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Utilisateur</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900 hidden sm:table-cell">Email</th>
            <th scope="col" className="hidden md:table-cell px-6 py-4 font-semibold text-gray-900">Nom Complet</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Statut</th>
            <th scope="col" className="px-6 py-4 pr-8 font-semibold text-gray-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={String(user.id)} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-gray-500 sm:hidden text-xs mt-0.5">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">{user.email}</td>
                <td className="hidden md:table-cell px-6 py-4 text-gray-600">{user.name || '—'}</td>
                <td className="px-6 py-4">
                  <StatusBadge active={user.active} />
                </td>
                <td className="px-6 py-4 pr-8">
                  <div className="flex justify-end items-center gap-1">
                    {onDetail && (
                      <ActionButton icon={Eye} label="Voir détails" onClick={() => onDetail(user)} />
                    )}
                    <ActionButton icon={Pencil} label="Modifier" onClick={() => onEdit(user)} />
                    {user.active ? (
                      onDeactivate && (
                        <ActionButton icon={XCircle} label="Désactiver" variant="red" onClick={() => onDeactivate(String(user.id))} />
                      )
                    ) : (
                      onActivate && (
                        <ActionButton icon={CheckCircle} label="Activer" variant="green" onClick={() => onActivate(String(user.id))} />
                      )
                    )}
                    <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
                    {onResetPassword && (
                      <ActionButton icon={RotateCcw} label="Réinitialiser mot de passe" variant="purple" onClick={() => onResetPassword(String(user.id))} />
                    )}
                    {onRevokeToken && (
                      <ActionButton icon={Lock} label="Révoquer tokens" variant="yellow" onClick={() => onRevokeToken(String(user.id))} />
                    )}
                    <ActionButton icon={Trash2} label="Supprimer" variant="red" onClick={() => onDelete(String(user.id))} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}