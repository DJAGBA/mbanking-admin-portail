'use client';

import { useState } from 'react';
import { UpdateCustomLimitsRequest, RateLimit } from '@/src/types/rate-limit';
import { X } from 'lucide-react';

type CustomLimitsFormProps = {
  rateLimit: RateLimit;
  onSubmit: (data: UpdateCustomLimitsRequest) => Promise<void>;
  onCancel: () => void;
};

// Form component for updating custom rate limits for a user
export function CustomLimitsForm({ rateLimit, onSubmit, onCancel }: CustomLimitsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customPointsPerMinute: rateLimit.customPointsPerMinute?.toString() || '',
    customPointsPerHour: rateLimit.customPointsPerHour?.toString() || '',
    customPointsPerDay: rateLimit.customPointsPerDay?.toString() || '',
    notes: '',
  });

  // Handle input changes for all form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for updating custom limits with validation and error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: UpdateCustomLimitsRequest = {
        customPointsPerMinute: formData.customPointsPerMinute ? Number(formData.customPointsPerMinute) : null,
        customPointsPerHour: formData.customPointsPerHour ? Number(formData.customPointsPerHour) : null,
        customPointsPerDay: formData.customPointsPerDay ? Number(formData.customPointsPerDay) : null,
        ...(formData.notes && { notes: formData.notes }),
      };
      await onSubmit(data);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Remplacement par une balise HTML <form> sémantique */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixe */}
        <div className="flex items-center justify-between p-6 border-b shrink-0 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Limites personnalisées</h2>
            <p className="text-sm text-gray-500 mt-1">{rateLimit.username} — {rateLimit.planDisplayName}</p>
          </div>
          <button type="button" onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps — scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Valeurs du plan {rateLimit.planDisplayName} :</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Par minute</p>
                <p className="text-lg font-bold text-gray-900">{rateLimit.pointsPerMinute}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Par heure</p>
                <p className="text-lg font-bold text-gray-900">{rateLimit.pointsPerHour}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Par jour</p>
                <p className="text-lg font-bold text-gray-900">{rateLimit.pointsPerDay || '—'}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quota/minute</label>
              <input
                type="number" name="customPointsPerMinute" value={formData.customPointsPerMinute}
                onChange={handleChange} min={1} placeholder={String(rateLimit.pointsPerMinute)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quota/heure</label>
              <input
                type="number" name="customPointsPerHour" value={formData.customPointsPerHour}
                onChange={handleChange} min={1} placeholder={String(rateLimit.pointsPerHour)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quota/jour</label>
              <input
                type="number" name="customPointsPerDay" value={formData.customPointsPerDay}
                onChange={handleChange} min={1} placeholder={rateLimit.pointsPerDay?.toString() || '—'}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes" value={formData.notes} onChange={handleChange}
              rows={3} maxLength={500} placeholder="Note libre (max 500 caractères)"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
          </div>
        </div>

        {/* Footer — fixe */}
        <div className="p-6 border-t bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-xl disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}