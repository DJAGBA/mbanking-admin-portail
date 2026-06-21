'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRateLimits, deactivateUserPlan, updateCustomLimits } from '@/services/rate-limits.service';
import { getUrlLimits, createUrlLimit, deleteUrlLimit, assignUrlLimitUser, updateUrlLimitUser } from '@/services/url-limits.service';
import { RateLimit } from '@/src/types/rate-limit';
import { UrlLimit } from '@/src/types/url-limit';
import { RateLimitTable } from './components/rateLimitTable';
import { RateLimitFilters } from './components/rateLimitFilters';
import { CustomLimitsForm } from './components/customLimitsForm';
import { UrlTable } from './components/urlTable';
import { AssignUrlUserStepper } from './components/urlUserForm';
import { DeclareUrlUserWizard } from './components/declareUrlUser';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import { useRouter } from 'next/navigation';
import { Plus, RotateCw, AlertCircle, X, Zap, Link2 } from 'lucide-react';

export default function LimitesPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'urls'>('plans');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [rateLimitsLoading, setRateLimitsLoading] = useState(true);
  const [rateLimitsError, setRateLimitsError] = useState('');
  const [rateLimitsPage, setRateLimitsPage] = useState(1);
  const [rateLimitsLimit, setRateLimitsLimit] = useState(5);
  const [rateLimitsTotal, setRateLimitsTotal] = useState(0);
  const [rateLimitsTotalPages, setRateLimitsTotalPages] = useState(0);
  const [planName, setPlanName] = useState<string | undefined>(undefined);
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRateLimit, setEditingRateLimit] = useState<RateLimit | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [rateLimitsDialogOpen, setRateLimitsDialogOpen] = useState(false);
  const [rateLimitsDialogConfig, setRateLimitsDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [urls, setUrls] = useState<UrlLimit[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsError, setUrlsError] = useState('');
  const [urlsPage, setUrlsPage] = useState(1);
  const [urlsLimit, setUrlsLimit] = useState(5);
  const [urlsTotal, setUrlsTotal] = useState(0);
  const [urlsTotalPages, setUrlsTotalPages] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [urlsDialogOpen, setUrlsDialogOpen] = useState(false);
  const [urlsDialogConfig, setUrlsDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignUrlId, setAssignUrlId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const fetchRateLimits = useCallback(async () => {
    setRateLimitsLoading(true);
    setRateLimitsError('');
    try {
      const response = await getRateLimits(rateLimitsPage, rateLimitsLimit, planName, active);
      if (response?.data?.items) {
        setRateLimits(response.data.items);
        setRateLimitsTotal(response.data.pagination?.total || 0);
        setRateLimitsTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setRateLimitsError(error?.message || 'Erreur lors du chargement');
    } finally {
      setRateLimitsLoading(false);
    }
  }, [rateLimitsPage, rateLimitsLimit, planName, active]);

  const handleDeactivate = (userId: string) => {
    const target = rateLimits.find(r => String(r.userId) === userId);
    const currentStatus = target?.active ?? true;
    const actionText = currentStatus ? 'désactivé' : 'activé';

    setRateLimitsDialogConfig({
      title: `${currentStatus ? 'Désactiver' : 'Activer'} le plan`,
      message: `Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} le plan de cet utilisateur ?`,
      isDangerous: currentStatus,
      onConfirm: () => {
        setRateLimitsDialogConfig({
          title: 'Confirmer la modification',
          message: 'Voulez-vous vraiment continuer ?',
          isDangerous: currentStatus,
          onConfirm: async () => {
           try {
             await deactivateUserPlan(userId);
             setRateLimitsDialogOpen(false);
  
             setRateLimits((prevLimits) => 
             prevLimits.map(r => 
             String(r.userId) === userId 
            ? { ...r, active: !currentStatus } 
          : r
                )
                 );
  showSuccess(`Le plan de l'utilisateur ${target?.username || ''} a été ${actionText} avec succès !`);
} catch (err: unknown) {
  const error = err as Error;
  setRateLimitsDialogOpen(false);
  setRateLimitsError(error?.message || 'Erreur lors de la modification du plan');
}
          },
        });
      },
    });
    setRateLimitsDialogOpen(true);
  };
  const handleEdit = (userId: string) => {
    const rateLimit = rateLimits.find(r => String(r.userId) === userId);
    if (rateLimit) {
      setEditingRateLimit(rateLimit);
      setEditingUserId(userId);
      setShowCustomForm(true);
    }
  };

  const fetchUrls = useCallback(async () => {
    setUrlsLoading(true);
    setUrlsError('');
    try {
      const response = await getUrlLimits(urlsPage, urlsLimit);
      if (response?.data?.items) {
        setUrls(response.data.items);
        setUrlsTotal(response.data.pagination?.total || 0);
        setUrlsTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setUrlsError(error?.message || 'Erreur lors du chargement');
    } finally {
      setUrlsLoading(false);
    }
  }, [urlsPage, urlsLimit]);

  const handleAssignUser = (urlId: string) => {
    setAssignUrlId(urlId);
    setEditingUser(null);
    setShowAssignForm(true);
  };

  const handleSubmitAssignUser = async (userId: string, data: any) => {
    try {
      setUrlsLoading(true);
      if (editingUser) {
        await updateUrlLimitUser(assignUrlId!, editingUser.userId, data);
        showSuccess('Limites modifiées avec succès !');
      } else {
        await assignUrlLimitUser(assignUrlId!, userId, data);
        showSuccess('Utilisateur assigné avec succès !');
      }
      await fetchUrls();
      setShowAssignForm(false);
      setAssignUrlId(null);
      setEditingUser(null);
    } catch (err: unknown) {
      const error = err as Error;
      setUrlsError(error.message || "Erreur lors de l'opération");
    } finally {
      setUrlsLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      // 1. Créer l'URL
      const newUrl = await createUrlLimit({ url: data.url });
      setShowWizard(false);

      // 2. Assigner les quotas à chaque utilisateur sélectionné
      if (newUrl && data.users && data.users.length > 0) {
        await Promise.all(
          data.users.map((user: any) =>
            assignUrlLimitUser(String(newUrl.id), String(user.id), {
              pointsPerMinute: data.pointsPerMinute,
              pointsPerHour: data.pointsPerHour,
              ...(data.pointsPerDay && { pointsPerDay: data.pointsPerDay }),
            })
          )
        );
      }

      await fetchUrls();
      showSuccess('URL déclarée et utilisateurs assignés avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setUrlsError(error?.message || 'Erreur lors de la création');
    }
  };

  const handleDelete = (id: string) => {
    setUrlsDialogConfig({
      title: "Supprimer l'URL",
      message: 'Êtes-vous sûr de vouloir supprimer cette URL ?',
      description: 'Toutes les limites configurées sur cette URL seront supprimées.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteUrlLimit(id);
          if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
            setUrls(prev => prev.filter(u => String(u.id) !== id));
            setUrlsTotal(prev => prev - 1);
          } else {
            await fetchUrls();
          }
          setUrlsDialogOpen(false);
          showSuccess('URL supprimée avec succès !');
        } catch (err: unknown) {
          const error = err as Error;
          setUrlsError(error?.message || 'Erreur lors de la suppression');
          setUrlsDialogOpen(false);
        }
      }
    });
    setUrlsDialogOpen(true);
  };

  useEffect(() => {
    fetchRateLimits();
  }, [fetchRateLimits]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return (
    <>
      {rateLimitsDialogConfig && (
        <ConfirmDialog
          isOpen={rateLimitsDialogOpen}
          title={rateLimitsDialogConfig.title}
          message={rateLimitsDialogConfig.message}
          description={rateLimitsDialogConfig.description}
          isDangerous={rateLimitsDialogConfig.isDangerous}
          confirmText="Confirmer"
          cancelText="Annuler"
          onConfirm={rateLimitsDialogConfig.onConfirm}
          onCancel={() => setRateLimitsDialogOpen(false)}
        />
      )}

      {urlsDialogConfig && (
        <ConfirmDialog
          isOpen={urlsDialogOpen}
          title={urlsDialogConfig.title}
          message={urlsDialogConfig.message}
          description={urlsDialogConfig.description}
          isDangerous={urlsDialogConfig.isDangerous}
          confirmText="Confirmer"
          cancelText="Annuler"
          onConfirm={urlsDialogConfig.onConfirm}
          onCancel={() => setUrlsDialogOpen(false)}
        />
      )}


      {showCustomForm && editingRateLimit && (
        <CustomLimitsForm
          rateLimit={editingRateLimit}
          onSubmit={async (data) => {
            try {
              await updateCustomLimits(editingUserId!, data);
              setShowCustomForm(false);
              setEditingUserId(null);
              setEditingRateLimit(null);
              await fetchRateLimits();
              showSuccess(`Limites de l'utilisateur ${editingRateLimit.username || ''} modifiées avec succès !`);
            } catch (err: unknown) {
              const error = err as Error;
              setRateLimitsError(error?.message || 'Erreur lors de la mise à jour');
            }
          }}
          onCancel={() => {
            setShowCustomForm(false);
            setEditingUserId(null);
            setEditingRateLimit(null);
          }}
        />
      )}

      {showWizard && (
        <DeclareUrlUserWizard
          onSubmit={handleCreate}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showAssignForm && assignUrlId && (
        <AssignUrlUserStepper
          user={editingUser}
          onSubmit={handleSubmitAssignUser}
          onCancel={() => {
            setShowAssignForm(false);
            setAssignUrlId(null);
            setEditingUser(null);
          }}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Limites de taux</h1>
          <p className="text-gray-600">Administrez les privilèges d'accès et réglez les limites de consommation assignées à chaque utilisateur.</p>
        </div>

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

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'plans'
                ? 'bg-[#00377D] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Limites par Plans
          </button>
          <button
            onClick={() => setActiveTab('urls')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'urls'
                ? 'bg-[#00377D] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Limites par URLs
          </button>
        </div>

        {activeTab === 'plans' && (
          <div className="space-y-6">
            {rateLimitsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-600 font-medium">{rateLimitsError}</p>
                </div>
                <button onClick={() => setRateLimitsError('')} className="text-red-600 hover:text-red-600 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <RateLimitFilters
                planName={planName}
                active={active}
                onPlanNameChange={(value) => {
                  setPlanName(value);
                  setRateLimitsPage(1);
                }}
                onActiveChange={(value) => {
                  setActive(value);
                  setRateLimitsPage(1);
                }}
              />
              <button
                onClick={() => fetchRateLimits()}
                disabled={rateLimitsLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FFD100', color: '#00377D' }}
              >
                <RotateCw className={`w-4 h-4 ${rateLimitsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {rateLimitsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-primary animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
              ) : rateLimits.length > 0 ? (
                <>
                  <RateLimitTable
                    rateLimits={rateLimits}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivate}
                    onDetail={(userId) => router.push(`/rate-limits/${userId}`)}
                  />
                  <div className="border-t border-gray-200">
                    <Pagination
                      page={rateLimitsPage}
                      totalPages={rateLimitsTotalPages}
                      total={rateLimitsTotal}
                      limit={rateLimitsLimit}
                      onPageChange={setRateLimitsPage}
                      onLimitChange={(newLimit) => {
                        setRateLimitsLimit(newLimit);
                        setRateLimitsPage(1);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune limite configurée</h3>
                  <p className="text-gray-500">Aucun utilisateur n'a de plan actif pour le moment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'urls' && (
          <div className="space-y-6">
            {urlsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-600 font-medium">{urlsError}</p>
                </div>
                <button onClick={() => setUrlsError('')} className="text-red-600 hover:text-red-600 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => fetchUrls()}
                disabled={urlsLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FFD100', color: '#00377D' }}
              >
                <RotateCw className={`w-4 h-4 ${urlsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Déclarer une nouvelle URL
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {urlsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
              ) : urls.length > 0 ? (
                <>
                  <UrlTable
                    urls={urls}
                    onDelete={handleDelete}
                  />
                  <div className="border-t border-gray-200">
                    <Pagination
                      page={urlsPage}
                      totalPages={urlsTotalPages}
                      total={urlsTotal}
                      limit={urlsLimit}
                      onPageChange={setUrlsPage}
                      onLimitChange={(newLimit) => {
                        setUrlsLimit(newLimit);
                        setUrlsPage(1);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune URL déclarée</h3>
                  <p className="text-gray-500 mb-6">Commencez par déclarer une URL</p>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Déclarer une nouvelle URL
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}