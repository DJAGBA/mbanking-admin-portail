'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUrlLimitById, getUrlLimitUsers, assignUrlLimitUser, updateUrlLimitUser,deleteUrlLimitUser} from '@/services/url-limits.service';
import { UrlLimit, UrlLimitUser, AssignUrlUserRequest, UpdateUrlUserRequest } from '@/src/types/url-limit';
import { UrlUserTable } from '../components/urlUserTable';
import { AssignUrlUserStepper } from '../components/urlUserForm';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import { Pagination } from '@/components/ui/pagination';
import { ArrowLeft, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
export default function UrlLimitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const urlId = params.id as string;

  const [urlLimit, setUrlLimit] = useState<UrlLimit | null>(null);
  const [users, setUsers] = useState<UrlLimitUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UrlLimitUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ title: string; message: string; description?: string; isDangerous?: boolean;onConfirm: () => void;
  } | null>(null);
// ========== FETCH DATA ==========
  const fetchUrlLimit = async () => {
    try {
      setLoading(true);
      const response = await getUrlLimitById(urlId);
      setUrlLimit(response);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await getUrlLimitUsers(urlId, page, limit);
      if (response?.data?.items) {
        setUsers(response.data.items);
        setTotal(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (err: unknown) {
      console.error('Erreur users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (urlId) {
      fetchUrlLimit();
      fetchUsers();
    }
  }, [urlId, page, limit]);

// ========== HANDLERS ==========
  const handleAssign = async (userId: string, data: AssignUrlUserRequest) => {
    try {
      await assignUrlLimitUser(urlId, userId, data);
      await fetchUsers();
      toast.success('Limites assignées avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Erreur lors de l'assignation");
      toast.error(error?.message || "Erreur lors de l'assignation");
    } finally {
      setShowForm(false);
    }
  };

  const handleUpdate = async (data: UpdateUrlUserRequest) => {
    if (!editingUser) return;
    try {
      await updateUrlLimitUser(urlId, String(editingUser.userId), data);
      await fetchUsers();
      toast.success('Limites modifiées avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la modification');
      toast.error(error?.message || 'Erreur lors de la modification');
    } finally {
      setEditingUser(null);
      setShowForm(false);
    }
  };

  const handleDelete = (userId: string) => {
  setDialogConfig({
    title: 'Première confirmation',
    message: 'Voulez-vous vraiment supprimer les limites de cet utilisateur ?',
    description: 'Une seconde confirmation sera requise.',
    isDangerous: true,
    onConfirm: () => {
      setDialogConfig({
        title: 'Confirmation finale',
        message: 'Action irréversible : confirmer la suppression définitive ?',
        description: 'Les quotas personnalisés seront effacés immédiatement.',
        isDangerous: true,
        onConfirm: async () => {
          try {
            await deleteUrlLimitUser(urlId, userId);
            await fetchUsers();
            setDialogOpen(false);
            toast.success('Limites supprimées avec succès !');
          } catch (err: unknown) {
            const error = err as Error;
            setError(error?.message || 'Erreur lors de la suppression');
            setDialogOpen(false);
          }
        },
      });
    },
  });
  setDialogOpen(true);
};

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    );
  }

  if (!urlLimit) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <p className="text-gray-600">URL introuvable</p>
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

      {showForm && (
      <AssignUrlUserStepper
  user={editingUser}
  onSubmit={async (userId: string, data: UpdateUrlUserRequest | AssignUrlUserRequest) => {
    if (editingUser) {
      await handleUpdate(data as UpdateUrlUserRequest);
    } else {
      await handleAssign(userId, data as AssignUrlUserRequest);
    }
  }}
  onCancel={() => {
    setShowForm(false);
    setEditingUser(null);
  }}
/>
      )}

      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Détail URL</h1>
          <p className="font-mono text-gray-600 mt-1">{urlLimit.url}</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">URL</p>
              <p className="font-mono font-medium text-gray-900">{urlLimit.url}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Créé le</p>
              <p className="text-gray-900">
                {urlLimit.createdAt
                  ? new Date(urlLimit.createdAt).toLocaleDateString('fr-FR')
                  : '—'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Utilisateurs configurés</h2>
            <button
              onClick={() => { setEditingUser(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Assigner des limites à un utilisateur
            </button>
          </div>

          {usersLoading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
            </div>
          ) : (
            <>
              <UrlUserTable
                users={users}
                onEdit={(user) => { setEditingUser(user); setShowForm(true); }}
                onDelete={handleDelete}
              />
              {totalPages > 1 && (
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
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}