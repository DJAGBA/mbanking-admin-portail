'use client';

import { UrlLimit } from '@/src/types/url-limit';
import { Eye, Trash2, Pencil, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
type UrlTableProps = {
  urls: UrlLimit[]
  onDelete: (id: string) => void
}
// Main component to display a table of URL limits with their details and actions (view details, delete)
export function UrlTable({ urls, onDelete }: UrlTableProps) {
  const router = useRouter();

  if (urls.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">Aucune URL déclarée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">URL</th>
            <th scope="col" className="px-6 py-4 font-semibold text-gray-900">Créé le</th>
            <th scope="col" className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {urls.map((url) => (
            <tr key={url.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-6 py-4">
                <span className="font-mono font-medium text-gray-900">{url.url}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600">
                  {url.createdAt
                    ? new Date(url.createdAt).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end items-center gap-2">
                  {/* Détail (Eye) */}
                  <div className="relative group/btn">
                    <button
                      onClick={() => router.push(`/url-limits/${url.id}`)}
                      className="p-2 rounded-lg text-blue-900 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-50">
                      Voir détails
                    </span>
                  </div>
                  <div className="w-3 h-5" />
                  <div className="relative group/btn">
                  </div>
                  <div className="w-3 h-5" />
                  <div className="relative group/btn">
                    <button
                      onClick={() => onDelete(String(url.id))}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
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