'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserById, updateUser, activateUser, deactivateUser, resetPassword, revokeTokens, deleteUser } from '@/services/users.service';
import { UserData, UpdateUserRequest } from '@/src/types/user';
import { ArrowLeft, AlertCircle, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import { toast } from 'sonner'
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  } | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        setUser(response);
        setFormData({
          name: response?.name || '',
          email: response?.email || '',
          version: response?.version || '',
          operation: response?.operation || '',
          callbackUrl: response?.callbackUrl || '',
          corporateMomoAccount: response?.corporateMomoAccount || '',
          corporateMomoCode: response?.corporateMomoCode || '',
          momoAlias: response?.momoAlias || '',
          momoCode: response?.momoCode || '',
        });
      } catch (err: unknown) {
        const error = err as Error;
        setError(error?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);
// Handle input changes for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
// Save changes made in the edit form
  const handleSave = async () => {
    try {
      setError('');
      const updated = await updateUser(userId, formData);
      setUser(updated);
      setFormData({
        name: updated?.name || '',
        email: updated?.email || '',
        version: updated?.version || '',
        operation: updated?.operation || '',
        callbackUrl: updated?.callbackUrl || '',
        corporateMomoAccount: updated?.corporateMomoAccount || '',
        corporateMomoCode: updated?.corporateMomoCode || '',
        momoAlias: updated?.momoAlias || '',
        momoCode: updated?.momoCode || '',
      });
      setIsEditing(false);
      setError('');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la mise à jour');
    }
  };
// Handlers for activate, deactivate, reset password, revoke tokens, and delete actions with confirmation dialogs
  const handleActivate = async () => {
    setDialogConfig({
      title: 'Activer l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir activer cet utilisateur ?',
      onConfirm: async () => {
        try {
          await activateUser(userId);
          const updated = await getUserById(userId);
          setUser(updated);
          setDialogOpen(false);
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de l\'activation');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };
// Similar structure for deactivation, reset password, revoke tokens, and delete with appropriate messages and error handling
  const handleDeactivate = async () => {
    setDialogConfig({
      title: 'Désactiver l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?',
      description: 'Les tokens actifs seront révoqués.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deactivateUser(userId);
          const updated = await getUserById(userId);
          setUser(updated);
          setDialogOpen(false);
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de la désactivation');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };
// Handler for resetting password with confirmation dialog
  const handleResetPassword = async () => {
    setDialogConfig({
      title: 'Réinitialiser le mot de passe',
      message: 'Un nouvel email sera envoyé à l\'utilisateur.',
      description: 'Voulez-vous continuer ?',
      onConfirm: async () => {
        try {
          await resetPassword(userId);
          setError('');
          toast.success('Password réinitialisé et email envoyé !');
          setDialogOpen(false);
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de la réinitialisation');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };
// Handler for revoking tokens with confirmation dialog
  const handleRevokeTokens = async () => {
    setDialogConfig({
      title: 'Révoquer les tokens',
      message: 'L\'utilisateur devra se reconnecter.',
      description: 'Voulez-vous continuer ?',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await revokeTokens(userId);
          setError('');
          toast.success('Tokens révoqués !')
          setDialogOpen(false);
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de la révocation');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };
// Handler for deleting user with confirmation dialog
  const handleDelete = async () => {
    setDialogConfig({
      title: 'Supprimer l\'utilisateur',
      message: 'Êtes-vous SÛR de vouloir supprimer cet utilisateur ?',
      description: 'Cette action est irréversible.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          router.push('/admin/users');
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de la suppression');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary/90">
          <ArrowLeft className="w-4 h-4"/> Retour
        </button>
        <p className="text-gray-600">Utilisateur non trouvé</p>
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
      <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary/90 mb-4">
            <ArrowLeft className="w-4 h-4"/> Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.active ? (
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Désactiver
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Activer
            </button>
          )}
        </div>
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

      {/* STATUS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Statut</p>
            <div className="flex items-center gap-2">
              {user.active ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700">
                  <span className="block w-2 h-2 rounded-full bg-green-600" />
                  Actif
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700">
                  <span className="block w-2 h-2 rounded-full bg-red-600" />
                  Inactif
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Dates</p>
            <p className="text-sm text-gray-900">Créé: {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
            <p className="text-sm text-gray-900">Modifié: {new Date(user.updatedAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Informations</h2>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Version</label>
                <input
                  type="text"
                  name="version"
                  value={formData.version || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Type d&apos;opération</label>
                <input
                  type="text"
                  name="operation"
                  value={formData.operation || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">URL Callback</label>
              <input
                type="url"
                name="callbackUrl"
                value={formData.callbackUrl || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations MoMo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code MoMo</label>
                  <input
                    type="text"
                    name="momoCode"
                    value={formData.momoCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alias MoMo</label>
                  <input
                    type="text"
                    name="momoAlias"
                    value={formData.momoAlias || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compte Corporate</label>
                  <input
                    type="text"
                    name="corporateMomoAccount"
                    value={formData.corporateMomoAccount || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code Corporate</label>
                  <input
                    type="text"
                    name="corporateMomoCode"
                    value={formData.corporateMomoCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  />
                </div>
              </div>
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
                className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors" style={{ backgroundColor: '#1e3a8a' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#162a63'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                <p className="text-gray-900 font-medium">{user.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Version</p>
                <p className="text-gray-900 font-medium">{user.version || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type d&apos;opération</p>
                <p className="text-gray-900 font-medium">{user.operation || '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">URL Callback</p>
              <p className="text-gray-900 font-medium break-all">{user.callbackUrl || '—'}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations MoMo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Code MoMo</p>
                  <p className="text-gray-900 font-medium">{user.momoCode || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alias MoMo</p>
                  <p className="text-gray-900 font-medium">{user.momoAlias || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compte Corporate</p>
                  <p className="text-gray-900 font-medium">{user.corporateMomoAccount || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Code Corporate</p>
                  <p className="text-gray-900 font-medium">{user.corporateMomoCode || '—'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetPassword}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réinitialiser le mot de passe
          </button>
          <button
            onClick={handleRevokeTokens}
            className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Révoquer les tokens
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer l&apos;utilisateur
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
