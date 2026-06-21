'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plan } from '@/src/types/plan';
import { X } from 'lucide-react';
interface PlanDetailModalProps { plan: Plan; onClose: () => void;}
// Small internal component to avoid repeating styles
const InfoRow = ({ label, value, isLast = false, isStatus = false }: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
  isStatus?: boolean;
}) => (
  <div className={`flex justify-between py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <span className="text-gray-500 font-medium">{label}</span>
    <span className={`text-gray-900 ${isStatus ? '' : 'font-semibold'}`}>{value || '—'}</span>
  </div>
);
// Main component for the plan detail modal
export default function PlanDetailModal({ plan, onClose }: PlanDetailModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay plus sombre pour plus de focus */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal avec coins arrondis */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Croix grise et discrète */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Détail du plan</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer la modale"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Contenu scrollable */}
        <div className="p-6 overflow-y-auto space-y-1">
          <InfoRow label="Nom" value={plan.name} />
          <InfoRow label="Nom d'affichage" value={plan.displayName} />
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Description</span>
            <span className="text-gray-900 text-sm max-w-[250px] text-right">
              {plan.description || '—'}
            </span>
          </div>
          {/* Section Quotas */}
          <div className="pt-2">
            <InfoRow label="Points par minute" value={plan.pointsPerMinute?.toLocaleString()} />
            <InfoRow label="Points par heure" value={plan.pointsPerHour?.toLocaleString()} />
            <InfoRow label="Points par jour" value={plan.pointsPerDay?.toLocaleString()} />
          </div>
          {/* Statut */}
          <InfoRow
            label="Statut"
            isStatus
            value={
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {plan.active ? 'Actif' : 'Inactif'}
              </span>
            }
          />
          {/* Dates */}
          <div className="pt-2">
            <InfoRow
              label="Créé le"
              value={
                plan.createdAt
                  ? new Date(plan.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'
              }
            />
            <InfoRow
              label="Modifié le"
              value={
                plan.updatedAt
                  ? new Date(plan.updatedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'
              }
              isLast
            />
          </div>
        </div>
        {/* Footer - Bouton de fermeture rouge */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}