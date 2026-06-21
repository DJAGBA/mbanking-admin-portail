'use client';

import { useState } from 'react';
import { CreateServiceRequest } from '@/src/types/bank';
import { X } from 'lucide-react';
type ServiceFormProps = {
  onSubmit: (data: CreateServiceRequest) => Promise<void>
  onCancel: () => void
}
// Component for the form to create a new service, with validation and error handling
export function ServiceForm({ onSubmit, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ label: '', optionDigit: '', position: '', menuLevelId: '2', operationType: '',});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setError('');
    try {
      const data: CreateServiceRequest = {
        label: formData.label,
        optionDigit: Number(formData.optionDigit),
        position: Number(formData.position),
        menuLevelId: Number(formData.menuLevelId),
        ...(formData.operationType && { operationType: formData.operationType }),
      };
      await onSubmit(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un service</h2>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
        {/* FORM */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Libellé <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              placeholder="ex: Transfert Banque vers Wallet"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type d&apos;opération
            </label>
            <input
              type="text"
              name="operationType"
              value={formData.operationType}
              onChange={handleChange}
              placeholder="ex: b2w, balance, statement"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chiffre USSD <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="optionDigit"
                value={formData.optionDigit}
                onChange={handleChange}
                required
                min={1}
                placeholder="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Position <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                min={1}
                placeholder="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Niveau menu <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="menuLevelId"
                value={formData.menuLevelId}
                onChange={handleChange}
                required
                min={1}
                placeholder="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
          </div>
          {/* FOOTER */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg bg-primary hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}