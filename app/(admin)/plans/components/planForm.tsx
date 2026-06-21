'use client';

import { useState } from 'react';
import { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/src/types/plan';
import { X, Loader2 } from 'lucide-react';

type PlanFormProps = Readonly<{
  plan?: Plan | null;
  onSubmit: (data: CreatePlanRequest | UpdatePlanRequest) => Promise<void>;
  onCancel: () => void;
}>;

// Modal form component for creating/editing a plan
export function PlanForm({ plan, onSubmit, onCancel }: PlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    displayName: plan?.displayName || '',
    pointsPerMinute: plan?.pointsPerMinute || '',
    pointsPerHour: plan?.pointsPerHour || '',
    pointsPerDay: plan?.pointsPerDay || '',
    description: plan?.description || '',
  });

  // Handle input changes for all form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for both create and update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Tous les champs étant obligatoires, on convertit et on passe tout directement
      const data = {
        name: formData.name,
        displayName: formData.displayName,
        pointsPerMinute: Number(formData.pointsPerMinute),
        pointsPerHour: Number(formData.pointsPerHour),
        pointsPerDay: Number(formData.pointsPerDay),
        description: formData.description,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {plan ? 'Modifier le plan' : 'Créer un plan'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Corps scrollable */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Nom <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!!plan}
                required
                maxLength={50}
                autoComplete="off"
                placeholder="ex: Free, standard, premium..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.name.length} / 50
              </p>
            </div>

            {/* Nom d'affichage */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900 mb-2">
                Nom d'affichage <span className="text-red-600">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                maxLength={100}
                autoComplete="off"
                placeholder="ex: Free Plan, Standard Plan, Premium Plan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.displayName.length} / 100
              </p>
            </div>

            {/* Grille Quotas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quota / min */}
              <div>
                <label htmlFor="pointsPerMinute" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/min <span className="text-red-600">*</span>
                </label>
                <input
                  id="pointsPerMinute"
                  type="number"
                  name="pointsPerMinute"
                  value={formData.pointsPerMinute}
                  onChange={handleChange}
                  required
                  min={1}
                  autoComplete="off"
                  placeholder="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>

              {/* Quota / h */}
              <div>
                <label htmlFor="pointsPerHour" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/h <span className="text-red-600">*</span>
                </label>
                <input
                  id="pointsPerHour"
                  type="number"
                  name="pointsPerHour"
                  value={formData.pointsPerHour}
                  onChange={handleChange}
                  required
                  min={1}
                  autoComplete="off"
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>

              {/* Quota / j */}
              <div>
                <label htmlFor="pointsPerDay" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/j <span className="text-red-600">*</span>
                </label>
                <input
                  id="pointsPerDay"
                  type="number"
                  name="pointsPerDay"
                  value={formData.pointsPerDay}
                  onChange={handleChange}
                  required
                  min={1}
                  autoComplete="off"
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
            </div>

           <div>
  <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
    Description 
  </label>
  <textarea
    id="description"
    name="description"
    value={formData.description || ''}
    onChange={handleChange}
    rows={3}
    maxLength={255}
    autoComplete="off"
    placeholder="Description du plan (optionnelle)"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white resize-none"
  />
  <p className="text-xs text-gray-500 mt-1 text-right">
    {(formData.description || '').length} / 255
  </p>
</div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-white font-semibold rounded-lg bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Enregistrement...' : plan ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}