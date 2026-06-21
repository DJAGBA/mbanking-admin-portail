'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlanById, updatePlan } from '@/services/plans.service';
import { Plan, UpdatePlanRequest } from '@/src/types/plan';
import { ArrowLeft, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePlanRequest>({});
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await getPlanById(planId);
        setPlan(response);
        setFormData({
          displayName: response?.displayName || '',
          pointsPerMinute: response?.pointsPerMinute || 0,
          pointsPerHour: response?.pointsPerHour || 0,
          pointsPerDay: response?.pointsPerDay || undefined,
          description: response?.description || '',
        });
      } catch (err: unknown){
        const error = err as Error;
        setError(error?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    if (planId) fetchPlan();
  }, [planId]);

  // Handle input changes for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdatePlanRequest) => ({
      ...prev,
      [name]: ['pointsPerMinute', 'pointsPerHour', 'pointsPerDay'].includes(name)
        ? Number(value)
        : value
    }));
  };
  // Save changes made in the edit form
  const handleSave = async () => {
    try {
      setError('');
      await updatePlan(planId, formData);
      const updated = await getPlanById(planId);
      setPlan(updated);
      setIsEditing(false);
      toast.success('Plan modifié avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la mise à jour');
    }
  };
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-4 border-gray-200 animate-spin mb-4"
          style={{ borderTopColor: '#1e3a8a' }}
        />
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    );
  }
  if (!plan) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <p className="text-gray-600">Plan non trouvé</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{plan.displayName}</h1>
          <p className="text-gray-600 font-mono">{plan.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          plan.active
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {plan.active ? 'Actif' : 'Inactif'}
        </span>
      </div>
      {/* ERROR ALERT */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* QUOTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Quota / minute</p>
          <p className="text-3xl font-bold text-primary">{plan.pointsPerMinute}</p>
          <p className="text-xs text-gray-400 mt-1">req/min</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Quota / heure</p>
          <p className="text-3xl font-bold text-primary">{plan.pointsPerHour}</p>
          <p className="text-xs text-gray-400 mt-1">req/h</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Quota / jour</p>
          <p className="text-3xl font-bold text-primary">
            {plan.pointsPerDay || '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">req/jour</p>
        </div>
      </div>
      {/* DETAILS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Informations</h2>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900 mb-2">
                Nom d&apos;affichage <span className="text-red-600">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pointsPerMinute" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/minute <span className="text-red-600">*</span>
                </label>
                <input
                  id="pointsPerMinute"
                  type="number"
                  name="pointsPerMinute"
                  value={formData.pointsPerMinute || ''}
                  onChange={handleInputChange}
                  min={1}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label htmlFor="pointsPerHour" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/heure <span className="text-red-600">*</span>
                </label>
                <input
                  id="pointsPerHour"
                  type="number"
                  name="pointsPerHour"
                  value={formData.pointsPerHour || ''}
                  onChange={handleInputChange}
                  min={1}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label htmlFor="pointsPerDay" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quota/jour
                </label>
                <input
                  id="pointsPerDay"
                  type="number"
                  name="pointsPerDay"
                  value={formData.pointsPerDay || ''}
                  onChange={handleInputChange}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                onChange={handleInputChange}
                rows={3}
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.description || '').length}/255 caractères
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: '#1e3a8a' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#162a63'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom technique</p>
                <p className="text-gray-900 font-mono font-medium">{plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom d&apos;affichage</p>
                <p className="text-gray-900 font-medium">{plan.displayName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900 font-medium">{plan.description || '—'}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary transition-colors"
            >
              Modifier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}