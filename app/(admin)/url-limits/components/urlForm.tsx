'use client';

import { useState } from 'react';
import { CreateUrlRequest } from '@/src/types/url-limit';
import { X } from 'lucide-react';
type UrlFormProps = {
  onSubmit: (data: CreateUrlRequest) => Promise<void>
  onCancel: () => void
}
// Component for the form to declare a new URL limit, with validation and error handling
export function UrlForm({ onSubmit, onCancel }: UrlFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const urlPattern = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;

// Handle form submission for declaring a new URL limit with validation and error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedUrl = url.trim();
      if (!urlPattern.test(normalizedUrl)) {
        setError("Format invalide. Exemple attendu: /mpay-debit/v1/process");
        setLoading(false);
        return;
      }
      await onSubmit({ url: normalizedUrl });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Déclarer une URL</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        
        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              URL de l'endpoint <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
              required
              placeholder="ex: /mpay-debit/v1/process"
              pattern="^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$"
              title="Format attendu: /segment/segment, avec lettres minuscules, chiffres et tirets"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white font-mono"
            />
          </div>
          {/* FOOTER */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary"
            >
              {loading ? 'Enregistrement...' : 'Déclarer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}