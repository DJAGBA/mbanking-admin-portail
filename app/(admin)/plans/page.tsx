'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPlans, createPlan, updatePlan } from '@/services/plans.service';
import { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/src/types/plan';
import { PlanTable } from './components/planTable';
import { PlanFilters } from './components/planFilters';
import { PlanForm } from './components/planForm';
import PlanDetailModal from './components/planDetailModal';
import { Pagination } from '@/components/ui/pagination';
import { Plus, RotateCw, AlertCircle, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import { AssignPlanForm } from './components/assignPlanForm';
import { assignPlan } from '@/services/rate-limits.service';
import { AssignPlanRequest } from '@/src/types/rate-limit';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios'

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigningPlan, setAssigningPlan] = useState<Plan | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const fetchPlans = useCallback(async (options?: { page?: number }) => {
    const nextPage = options?.page ?? page;
    setLoading(true);
    setError('');
    try {
      const response = await getPlans(nextPage, limit, active);
      if (response?.data?.items) {
        setPlans(response.data.items);
        setTotal(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else {
        setPlans([]);
      }
      if (options?.page !== undefined && options.page !== page) {
        setPage(options.page);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, active]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async (data: CreatePlanRequest) => {
    try {
      await createPlan(data);
      setSuccessMessage('Le plan tarifaire a été créé avec succès !');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchPlans({ page: 1 });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (data: UpdatePlanRequest) => {
    try {
      if (editingPlan) {
        await updatePlan(String(editingPlan.id), data);
        setSuccessMessage('Le plan tarifaire a été modifié avec succès !');
        setEditingPlan(null);
        setShowForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchPlans();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la modification');
    }
  };

  const handleAssign = async (userIds: string[], data: AssignPlanRequest) => {
    try {
      await Promise.all(userIds.map(userId => assignPlan(userId, data)));
      setSuccessMessage(`Plan "${assigningPlan?.displayName}" affecté avec succès !`);
      setShowAssignForm(false);
      setAssigningPlan(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Erreur lors de l'affectation");
    }
  };

  const handleToggleStatus = (plan: Plan) => {
  const isDeactivating = plan.active;
  setDialogConfig({
    title: isDeactivating ? "Désactiver le plan tarifaire" : "Activer le plan tarifaire",
    message: `Êtes-vous sûr de vouloir ${isDeactivating ? 'désactiver' : 'activer'} le plan tarifaire ?`,
    description: isDeactivating
      ? "Les utilisateurs liés à ce palier ne pourront plus effectuer de requêtes."
      : "Ce palier sera de nouveau disponible pour la distribution des quotas.",
    isDangerous: isDeactivating,
    onConfirm: () => {
      setDialogConfig({
        title: "Confirmation finale",
        message: `Voulez-vous vraiment ${isDeactivating ? 'désactiver' : 'activer'} le plan "${plan.displayName}" ?`,
        isDangerous: isDeactivating,
        onConfirm: async () => {
          try {
            const nvoStatut = !plan.active;
            const payload: UpdatePlanRequest = {
              name: plan.name,
              displayName: plan.displayName,
              pointsPerMinute: plan.pointsPerMinute !== null ? Number(plan.pointsPerMinute) : 0,
              pointsPerHour: plan.pointsPerHour !== null ? Number(plan.pointsPerHour) : 0,
              pointsPerDay: plan.pointsPerDay !== null ? Number(plan.pointsPerDay) : 0,
              description: plan.description || '',
          
            };
            await updatePlan(String(plan.id), payload);
            setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, active: nvoStatut } : p));
            setDialogOpen(false);
            setSuccessMessage(`Le plan "${plan.displayName}" a été ${nvoStatut ? 'activé' : 'désactivé'} avec succès !`);
            setTimeout(() => setSuccessMessage(''), 3000);
            if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
              await fetchPlans();
            }
          } catch (err: unknown) {
  let apiMessage: string | undefined;

     if (isAxiosError(err)) {
  apiMessage = err.response?.data?.message || err.message;
    } else if (err instanceof Error) {
        apiMessage = err.message;
    }
       setError(`Erreur lors du changement de statut : ${apiMessage || "Serveur injoignable"}`);
         setDialogOpen(false);
     }
        },
        onCancel: () => setDialogOpen(false),
      });
      setDialogOpen(true);
    },
    onCancel: () => setDialogOpen(false),
  });
  setDialogOpen(true);
};

  function renderContent() {
    if (loading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-primary animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      );
    }
    if (plans.length > 0) {
      return (
        <>
          <PlanTable
            key={plans.map(p => `${p.id}-${p.active}`).join(',')}
            plans={plans}
            onEdit={(plan) => {
              setEditingPlan(plan);
              setShowForm(true);
            }}
            onDetail={(plan) => setSelectedPlan(plan)}
            onToggleStatus={handleToggleStatus}
            onAssign={(plan) => {
              setAssigningPlan(plan);
              setShowAssignForm(true);
            }}
          />
          <div className="border-t border-gray-200">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </>
      );
    }
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun plan</h3>
        <p className="text-gray-500 mb-6">Commencez par créer un plan tarifaire</p>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un plan
        </button>
      </div>
    );
  }

  return (
    <>
      {dialogConfig && (
        <ConfirmDialog
          isOpen={dialogOpen}
          title={dialogConfig.title}
          message={dialogConfig.message}
          description={dialogConfig.description}
          isDangerous={dialogConfig.isDangerous}
          confirmText="Confirmer"
          cancelText="Annuler"
          onConfirm={dialogConfig.onConfirm}
          onCancel={() => setDialogOpen(false)}
        />
      )}

      {showAssignForm && assigningPlan && (
        <AssignPlanForm
          initialPlanName={assigningPlan.name}
          onSubmit={handleAssign}
          onCancel={() => {
            setShowAssignForm(false);
            setAssigningPlan(null);
          }}
        />
      )}

      <div className="space-y-6">
        {selectedPlan && (
          <PlanDetailModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
        {showForm && (
          <PlanForm
            plan={editingPlan}
            onSubmit={async (data: CreatePlanRequest | UpdatePlanRequest) => {
              if (editingPlan) {
                await handleUpdate(data as UpdatePlanRequest);
              } else {
                await handleCreate(data as CreatePlanRequest);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingPlan(null);
            }}
          />
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plans tarifaires</h1>
          <p className="text-gray-600">Configurez les seuils de consommation et supervisez la distribution des quotas de requêtes par palier temporel.</p>
        </div>

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

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />
            <div className="flex-1">
              <p className="text-green-800 font-semibold">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <PlanFilters
            active={active}
            onActiveChange={(value) => {
              setActive(value);
              setPage(1);
            }}
          />
          <div className="flex gap-3 shrink-0">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchPlans();
                setIsRefreshing(false);
              }}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ backgroundColor: '#FFD100', color: '#00377D' }}
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer un plan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </>
  );
}