'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBanks, createBank, updateBank, deleteBank } from '@/services/bank.service';
import { Bank, CreateBankRequest, UpdateBankRequest } from '@/src/types/bank';
import { BankTable } from './components/bankTable';
import { BankForm } from './components/bankForm';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import { Plus, RotateCw, AlertCircle, X, Search } from 'lucide-react';
import { toast } from 'sonner';
// Main page component for managing partner banks, including listing, searching, creating, updating, and deleting banks with confirmation dialogs and pagination
export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    description?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  } | null>(null);
// Fetch the list of banks from the API with pagination and error handling
  const fetchBanks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBanks(page, limit);
      const apiResult = response;

      if (apiResult?.data?.items) {
        setBanks(apiResult.data.items);
        setTotal(apiResult.data.pagination?.total || 0);
        setTotalPages(apiResult.data.pagination?.totalPages || 0);
      } else {
        setBanks([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement des banques');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchBanks();
  }, [page, limit]);
  // Handler to create a new bank using the API, with error handling and success notification
  const handleCreate = async (data: CreateBankRequest) => {
  try {
    const newBank = await createBank(data);

    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && newBank) {
      setBanks(prev => [newBank, ...prev]);
      setTotal(prev => prev + 1);
    } else {
      await fetchBanks();
    }

    toast.success('Banque créée avec succès !');
    // Fermer le formulaire seulement après succès
    setShowForm(false);
  } catch (err: unknown) {
    const error = err as Error;
    setError(error?.message || 'Erreur lors de la création');
  }
};

const handleUpdate = async (data: UpdateBankRequest) => {
  try {
    if (editingBank) {
      await updateBank(String(editingBank.id), data);

      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        setBanks(prev => prev.map(b =>
          b.id === editingBank.id ? { ...b, ...data } : b
        ));
      } else {
        await fetchBanks();
      }

      toast.success('Banque modifiée avec succès !');
      // Fermer le formulaire seulement après succès
      setEditingBank(null);
      setShowForm(false);
    }
  } catch (err: unknown) {
    const error = err as Error;
    setError(error?.message || 'Erreur lors de la modification');
  }
};

// Handler to open the delete confirmation dialog for a bank, and if confirmed, call the API to delete it with error handling and success notification
  const handleDelete = (id: string) => {
    setDialogConfig({
      title: 'Supprimer la banque',
      message: 'Êtes-vous sûr de vouloir supprimer cette banque ?',
      description: 'Cette action est irréversible. Tous les services associés seront supprimés.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteBank(id);
          if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
            setBanks(prev => prev.filter(b => String(b.id) !== id));
            setTotal(prev => prev - 1);
          } else {
            await fetchBanks();
          }
          setDialogOpen(false);
          toast.success('Banque supprimée avec succès !');
        } catch (err: unknown) {
          const error = err as Error;
          setError(error?.message || 'Erreur lors de la suppression');
          setDialogOpen(false);
        }
      }
    });
    setDialogOpen(true);
  };
// Filter the list of banks based on the search term entered by the user, matching against bank name and alias
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBanks = normalizedSearch
    ? banks.filter((bank) =>
        bank.bankName.toLowerCase().includes(normalizedSearch) ||
        bank.bankAlias.toLowerCase().includes(normalizedSearch)
      )
    : banks;
// Render the main content of the page based on the loading state, search results, and available banks, including the table of banks or appropriate empty states
  function renderContent() {
    if (loading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-primary animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      );
    }

    if (filteredBanks.length > 0) {
      return (
        <>
          <BankTable
            banks={filteredBanks}
            onEdit={(bank) => {
              setEditingBank(bank);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
          {banks.length > 0 && (
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
      );
    }

    if (banks.length > 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
          <p className="text-gray-500 mb-4">Aucune banque ne correspond à votre recherche.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Effacer la recherche
          </button>
        </div>
      );
    }

    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune banque</h3>
        <p className="text-gray-500 mb-6">Commencez par créer une banque partenaire</p>
        <button
          onClick={() => {
            setEditingBank(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer une banque
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

      {showForm && (
        <BankForm
          bank={editingBank}
          onSubmit={async (data) => {
            if (editingBank) {
              await handleUpdate(data as UpdateBankRequest);
            } else {
              await handleCreate(data as CreateBankRequest);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingBank(null);
          }}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banques partenaires</h1>
          <p className="text-gray-600">Gestion des banques et leurs services USSD</p>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Recherche..."
              className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3">
           <button
  onClick={() => fetchBanks()}
  disabled={loading}
  className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ backgroundColor: '#FFD100', color: '#00377D' }}
>
  <RotateCw className="w-4 h-4" />
  Actualiser
</button>
            <button
              onClick={() => {
                setEditingBank(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer une banque
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