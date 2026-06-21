'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser, resetPassword, revokeTokens } from '@/services/users.service';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/src/types/user';
import { UserTable } from './components/userTable';
import UserDetailModal from './components/UserDetailModal';
import { UserFilters } from './components/userFilters';
import { UserForm } from './components/userForm';
import { Pagination } from '@/components/ui/pagination';
import { Plus, RotateCw, AlertCircle, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers(page, limit, search, active);
      if (response?.data?.items) {
        setUsers(response.data.items);
        setTotal(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, active]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (data: CreateUserRequest | UpdateUserRequest) => {
    try {
      setError('');
      const newUser = await createUser(data);
      
      if(newUser?.status?.code !== 200) {
        setError(newUser.status?.description ?? 'Erreur lors de la création');
      }else { setSuccessMessage("L'utilisateur a été créé avec succès !");
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && newUser) {
        const userWithDefaults: UserData = {
          ...newUser,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUsers(prev => [userWithDefaults, ...prev]);
        setTotal(prev => prev + 1);
        } else {
        await fetchUsers();
      }

       }
      
     
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (data: UpdateUserRequest) => {
    try {
      if (editingUser) {
        const response = await updateUser(editingUser.id, data);

        if(response?.status?.code !== 200) {
          setError(response.status?.description ?? 'Erreur lors du chargement');
        } else {
          setSuccessMessage("L'utilisateur a été mis à jour avec succès !");
          setEditingUser(null);
          setError('');
          setShowForm(false);
          setTimeout(() => setSuccessMessage(''), 3000);
          await fetchUsers();
        }

      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    setDialogConfig({
      title: "Supprimer l'utilisateur",
      message: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      isDangerous: true,
      onConfirm: () => {
        setDialogConfig({
          title: "Confirmation finale",
          message: "Cette action est irréversible. Voulez-vous vraiment continuer ?",
          isDangerous: true,
          onConfirm: async () => {
            try {
              await deleteUser(id);
              setDialogOpen(false);
              setSuccessMessage("L'utilisateur a été supprimé avec succès !");
              setTimeout(() => setSuccessMessage(''), 3000);
              await fetchUsers();
            } catch (err: unknown) {
              const error = err as Error;
              setError(error?.message || "Erreur lors de la suppression");
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

  const handleActivate = async (id: string) => {
    setDialogConfig({
      title: "Activer l'utilisateur",
      message: "Êtes-vous sûr de vouloir activer cet utilisateur ?",
      onConfirm: () => {
        setDialogConfig({
          title: "Confirmation finale",
          message: "Voulez-vous vraiment activer cet utilisateur ?",
          onConfirm: async () => {
            try {
              await activateUser(id);
              setDialogOpen(false);
              setSuccessMessage("L'utilisateur a été activé avec succès !");
              setTimeout(() => setSuccessMessage(''), 3000);
              setUsers(prev => prev.map(u => String(u.id) === String(id) ? { ...u, active: true } : u));
              if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
                await fetchUsers();
              }
            } catch (err: unknown) {
              setError((err as Error).message || "Erreur lors de l'activation");
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

  const handleDeactivate = async (id: string) => {
    setDialogConfig({
      title: "Désactiver l'utilisateur",
      message: "Êtes-vous sûr de désactiver cet utilisateur ?",
      isDangerous: true,
      onConfirm: () => {
        setDialogConfig({
          title: "Confirmation finale",
          message: "Voulez-vous vraiment désactiver cet utilisateur ?",
          isDangerous: true,
          onConfirm: async () => {
            try {
              await deactivateUser(id);
              setDialogOpen(false);
              setSuccessMessage("L'utilisateur a été désactivé avec succès !");
              setTimeout(() => setSuccessMessage(''), 3000);
              setUsers(prev => prev.map(u => String(u.id) === String(id) ? { ...u, active: false } : u));
              if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
                await fetchUsers();
              }
            } catch (err: unknown) {
              setError((err as Error).message || "Erreur lors de la désactivation");
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

  const handleResetPassword = async (id: string) => {
    setDialogConfig({
      title: 'Réinitialiser le mot de passe',
      message: "Un nouvel email sera envoyé à l'utilisateur.",
      onConfirm: () => {
        setDialogConfig({
          title: 'Confirmation finale',
          message: "Êtes-vous vraiment sûr de vouloir réinitialiser le mot de passe ?",
          onConfirm: async () => {
            try {
              await resetPassword(id);
              setDialogOpen(false);
              setSuccessMessage("Le mot de passe a bien été réinitialisé. Un email a été envoyé.");
              setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err: unknown) {
              const error = err as Error;
              setError(error?.message || 'Erreur lors de la réinitialisation');
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

  const handleRevokeToken = async (id: string) => {
    setDialogConfig({
      title: "Révoquer les tokens",
      message: "L'utilisateur devra se reconnecter.",
      description: "Voulez-vous continuer ?",
      isDangerous: true,
      onConfirm: () => {
        setDialogConfig({
          title: "Confirmation finale",
          message: "Êtes-vous vraiment sûr de vouloir révoquer les tokens ?",
          isDangerous: true,
          onConfirm: async () => {
            try {
              await revokeTokens(id);
              setDialogOpen(false);
              setSuccessMessage("Les jetons de connexion (tokens) ont été révoqués avec succès !");
              setTimeout(() => setSuccessMessage(''), 3000);
              await fetchUsers();
            } catch (err: unknown) {
              const error = err as Error;
              setError(error?.message || "Erreur lors de la révocation");
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
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      );
    }
    if (users.length > 0) {
      return (
        <>
          <div className="overflow-x-auto">
            <UserTable
              users={users}
              onEdit={(user: UserData) => {
                setEditingUser(user);
                setError('')
                setShowForm(true);
              }}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onResetPassword={handleResetPassword}
              onRevokeToken={handleRevokeToken}
              onDelete={handleDelete}
              onDetail={(user: UserData) => setSelectedUser(user)}
            />
            {selectedUser && (
              <UserDetailModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            )}
          </div>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur</h3>
        <p className="text-gray-500 mb-6">Commencez par créer un nouvel utilisateur</p>
        <button
          onClick={() => {
            setEditingUser(null);
            setError('')
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg transition-colors bg-primary hover:bg-primary"
        >
          <Plus className="w-4 h-4" />
          Créer un utilisateur
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Utilisateurs</h1>
          <p className="text-gray-600">
            Administrez les comptes utilisateurs, gérez les habilitations et surveillez les accès à la plateforme mbanking.
          </p>
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

        {showForm && (
          <UserForm
            user={editingUser}
            onSubmit={async ( formData) => {
              if (editingUser) {
                await handleUpdate(formData as UpdateUserRequest);
              } else {
                await handleCreate(formData);
              }
            }}
            onCancel={() => {
              setError('')
              setShowForm(false);
              setEditingUser(null);
            }}
            parentError={error}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-primary rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => fetchUsers()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ backgroundColor: '#FFD100', color: '#00377D' }}
            >
              <RotateCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                setError('')
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg transition-colors whitespace-nowrap bg-primary hover:bg-primary"
            >
              <Plus className="w-4 h-4" />
              Créer un utilisateur
            </button>
          </div>
        </div>

        <UserFilters
          search={search}
          active={active}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onActiveChange={(value) => {
            setActive(value);
            setPage(1);
          }}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </>
  );
}