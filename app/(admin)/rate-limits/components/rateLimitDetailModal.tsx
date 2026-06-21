'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getRateLimitByUser, getRateLimitHistory } from '@/services/rate-limits.service';
import { RateLimit, RateLimitHistory } from '@/src/types/rate-limit';
import { X } from 'lucide-react';
import { HistoryTable } from '../components/historyTable';

interface RateLimitDetailModalProps {
  userId: string;
  onClose: () => void;
}

const InfoRow = ({ label, value, isLast = false }: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) => (
  <div className={`flex justify-between py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-900 font-semibold">{value || '—'}</span>
  </div>
);

export default function RateLimitDetailModal({ userId, onClose }: RateLimitDetailModalProps) {
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [history, setHistory] = useState<RateLimitHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRateLimitByUser(userId);
      setRateLimit(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const response = await getRateLimitHistory(userId, 1, 50);
      if (response?.data?.items) {
        setHistory(response.data.items);
      } else {
        setHistory([]);
      }
    } catch (err: unknown) {
      console.error('Erreur historique:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
    fetchHistory();
  }, [fetchDetail, fetchHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Détail de la limite</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Historique
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          ) : activeTab === 'details' && rateLimit ? (
            <div className="space-y-1">
              <InfoRow label="Utilisateur" value={rateLimit.username} />
              <InfoRow label="Email" value={rateLimit.email} />
              <InfoRow label="Plan" value={rateLimit.planDisplayName} />
              <InfoRow label="Nom technique" value={rateLimit.planName} />

              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quotas</h3>
                <InfoRow label="Par minute" value={rateLimit.customPointsPerMinute ?? rateLimit.pointsPerMinute} />
                <InfoRow label="Par heure" value={rateLimit.customPointsPerHour ?? rateLimit.pointsPerHour} />
                <InfoRow label="Par jour" value={rateLimit.customPointsPerDay ?? rateLimit.pointsPerDay ?? '—'} />
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Période</h3>
                <InfoRow
                  label="Début"
                  value={
                    rateLimit.startDate
                      ? new Date(rateLimit.startDate).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })
                      : '—'
                  }
                />
                <InfoRow
                  label="Fin"
                  value={
                    rateLimit.endDate ? (
                      <div className="flex flex-col text-right">
                        <span>
                          {new Date(rateLimit.endDate).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span>
                          {(() => {
                            const d = new Date(rateLimit.endDate);
                            const h = d.getHours();
                            const m = d.getMinutes();
                            return h || m
                              ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              : 'à 23:59';
                          })()}
                        </span>
                      </div>
                    ) : '—'
                  }
                />
              </div>

              <InfoRow
                label="Statut"
                value={
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    rateLimit.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {rateLimit.active ? 'Actif' : 'Inactif'}
                  </span>
                }
                isLast
              />
            </div>
          ) : activeTab === 'history' ? (
            historyLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-primary animate-spin" />
              </div>
            ) : (
              <HistoryTable history={history} />
            )
          ) : null}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}