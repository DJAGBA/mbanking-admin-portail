'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRateLimitByUser, getRateLimitHistory } from '@/services/rate-limits.service';
import { RateLimit, RateLimitHistory } from '@/src/types/rate-limit';
import { HistoryTable } from '../components/historyTable';
import { Pagination } from '@/components/ui/pagination';
import { ArrowLeft } from 'lucide-react';
// Page component to display details of a user's rate limit and its history
export default function RateLimitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [history, setHistory] = useState<RateLimitHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyAction, setHistoryAction] = useState<string | undefined>(undefined);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(5);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const fetchRateLimit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRateLimitByUser(userId);
      setRateLimit(response);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  const fetchHistory = useCallback(async (action?: string, page = historyPage, limit = historyLimit) => {
    try {
      setHistoryLoading(true);
      const response = await getRateLimitHistory(userId, page, limit, action);
      setHistory(response?.data?.items || []);
      setHistoryTotal(response?.data?.pagination?.total || 0);
      setHistoryTotalPages(response?.data?.pagination?.totalPages || 0);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId, historyPage, historyLimit]);

  useEffect(() => {
    if (userId) {
      fetchRateLimit();
      fetchHistory(historyAction, historyPage, historyLimit);
    }
  }, [userId, fetchRateLimit, fetchHistory, historyAction, historyPage, historyLimit]);
// Handle filter changes for the history (e.g., created, updated, expired, cancelled)
  const handleFilterChange = (action: string) => {
    const value = action === 'tous' ? undefined : action;
    setHistoryAction(value);
    setHistoryPage(1);
    fetchHistory(value, 1, historyLimit);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!rateLimit) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary/90">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-600">
          Aucun plan actif pour cet utilisateur
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary/90 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{rateLimit.username}</h1>
            <p className="text-gray-600">{rateLimit.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${rateLimit.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {rateLimit.active ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
      )}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-900 font-semibold">{rateLimit.planDisplayName}</p>
            <p className="text-xs font-mono text-gray-500">{rateLimit.planName}</p>
          </div>
          <div>
                <p className="text-sm text-gray-500 mb-1">Date de fin</p>
                 <p className="text-gray-900">
                    {rateLimit.endDate ? (
                          <>
                         {new Date(rateLimit.endDate).toLocaleDateString('fr-FR')}
                              <br />
                         {(() => {
                        const d = new Date(rateLimit.endDate);
                       const h = d.getHours();
                          const m = d.getMinutes();
                   return h || m
            ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : 'à 23:59';
        })()}
      </>
    ) : '—'}
  </p>
           </div>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Quota / minute</p>
            <p className="text-2xl font-bold text-[#01050f]">{rateLimit.customPointsPerMinute ?? rateLimit.pointsPerMinute}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Quota / heure</p>
            <p className="text-2xl font-bold text-[#020613]">{rateLimit.customPointsPerHour ?? rateLimit.pointsPerHour}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Quota / jour</p>
            <p className="text-2xl font-bold text-[#03091c]">{rateLimit.customPointsPerDay ?? rateLimit.pointsPerDay ?? '—'}</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Historique</h2>
            <div className="flex gap-2">
              {[
                { value: 'tous', label: 'Tous' },
                { value: 'created', label: 'Cree' },
                { value: 'updated', label: 'Modifie' },
                { value: 'expired', label: 'Expire' },
                { value: 'cancelled', label: 'Annule' },
              ].map((action) => (
                <button
                  key={action.value}
                  onClick={() => handleFilterChange(action.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    (action.value === 'tous' && !historyAction) || historyAction === action.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {historyLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <HistoryTable history={history} />
            <div className="border-t border-gray-200">
              <Pagination
                page={historyPage}
                totalPages={historyTotalPages}
                total={historyTotal}
                limit={historyLimit}
                onPageChange={(nextPage) => {
                  setHistoryPage(nextPage);
                  fetchHistory(historyAction, nextPage, historyLimit);
                }}
                onLimitChange={(nextLimit) => {
                  setHistoryLimit(nextLimit);
                  setHistoryPage(1);
                  fetchHistory(historyAction, 1, nextLimit);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}