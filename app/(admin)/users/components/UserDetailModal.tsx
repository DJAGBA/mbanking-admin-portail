'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { UserData } from '@/src/types/user';
import { X } from 'lucide-react';
interface UserDetailModalProps {
  user: UserData;
  onClose: () => void;
}
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
export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  // Handle Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);
  // SSR safety: ensure document exists
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* OVERLAY with transition animation (recommended in a real project) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />
      {/* MODAL */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Détail utilisateur</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-6 overflow-y-auto space-y-1">
          <InfoRow label="Nom d'utilisateur" value={user.username} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Nom complet" value={user.name} />
          <InfoRow 
            label="Statut" 
            isStatus
            value={
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.active ? 'Actif' : 'Inactif'}
              </span>
            } 
          />
          <InfoRow label="Version" value={user.version} />
          <InfoRow label="Opération" value={user.operation} />
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Callback URL</span>
            <span className="text-gray-900 text-sm truncate max-w-[200px] bg-gray-50 px-2 rounded" title={user.callbackUrl}>
              {user.callbackUrl || '—'}
            </span>
          </div>
          <InfoRow label="Compte Momo Corporate" value={user.corporateMomoAccount} />
          <InfoRow label="Code Momo Corporate" value={user.corporateMomoCode} />
          <InfoRow label="Momo Alias" value={user.momoAlias} />
          <InfoRow label="Momo Code" value={user.momoCode} isLast />
        </div>
        {/* FIXED FOOTER */}
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