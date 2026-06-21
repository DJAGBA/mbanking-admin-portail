'use client';

import { UrlLimitUser } from '@/src/types/url-limit';
import { Pencil, Trash2 } from 'lucide-react';

type UrlUserTableProps = {
  users: UrlLimitUser[]
  onEdit: (user: UrlLimitUser) => void
  onDelete: (userId: string) => void
}
// Component to display a table of users assigned to a URL limit, with their quotas and actions to edit or delete the assignment
export function UrlUserTable({ users, onEdit, onDelete }: UrlUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">Aucun utilisateur configuré</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">
              Utilisateur
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">
              Quota/min
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">
              Quota/heure
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">
              Quota/jour
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">
              Statut
            </th>
            <th scope="col" className="px-6 py-4 text-right font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">

              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="text-gray-900">{user.pointsPerMinute} req/min</span>
              </td>

              <td className="px-6 py-4">
                <span className="text-gray-900">{user.pointsPerHour} req/h</span>
              </td>

              <td className="px-6 py-4">
                <span className="text-gray-900">
                  {user.pointsPerDay ? `${user.pointsPerDay} req/jour` : '—'}
                </span>
              </td>

              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  user.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    user.active ? 'bg-green-600' : 'bg-red-600'
                  }`} />
                  {user.active ? 'Actif' : 'Inactif'}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end items-center gap-2">
                  <div className="relative group/btn">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                      Modifier
                    </span>
                  </div>
                  <div className="relative group/btn">
                    <button
                      onClick={() => onDelete(String(user.userId))}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                      Supprimer
                    </span>
                  </div>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}