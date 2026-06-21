'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBankById, updateBank, addService, deleteService } from '@/services/bank.service';
// Correction of the ligne précédente : import { getBankById, updateBank, addService, deleteService } from '@/services/bank.service';
import { Bank, UpdateBankRequest, CreateServiceRequest, BankService } from '@/src/types/bank';
import { BankForm } from '../components/bankForm';
import { ServiceForm } from '../components/serviceForm';
import { ArrowLeft, AlertCircle, X, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function BankDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bankId = params.id as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [savingServices, setSavingServices] = useState(false);

  const serviceCatalog = [
    { key: 'bank-to-wallet', label: 'Bank to Wallet' },
    { key: 'wallet-to-bank', label: 'Wallet To Bank' },
    { key: 'balance', label: 'Balance' },
    { key: 'mini-statement', label: 'Mini Statement' },
    { key: 'bank-to-bank', label: 'Bank To Bank' },
  ];

  type ServiceFormRow = {
    key: string;
    label: string;
    code: string;
    optionDigit: string;
    position: string;
    menuLevelId: string;
    selected: boolean;
  };

  const [services, setServices] = useState<ServiceFormRow[]>([]);
// Fetch the bank details by ID and populate the form, also mapping existing services to the service catalog for selection in the form
  const fetchBank = async () => {
    try {
      setLoading(true);
      const response = await getBankById(bankId);
      setBank(response);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bankId) fetchBank();
  }, [bankId]);

  useEffect(() => {
    if (!bank) return;
    setServices(
      serviceCatalog.map(service => {
        const existing = bank.services?.find(item => item.label === service.label);
        return {
          ...service,
          selected: Boolean(existing),
          code: existing?.code || '',
          optionDigit: existing?.optionDigit?.toString() || '',
          position: existing?.position?.toString() || '',
          menuLevelId: existing?.menuLevelId?.toString() || '2',
        };
      })
    );
  }, [bank]);
// Handler to update bank details, which calls the API and updates the local state or refetches the bank details after a successful update, with error handling
  const handleUpdate = async (data: UpdateBankRequest) => {
    try {
      await updateBank(bankId, data);
      setShowEditForm(false);
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        setBank(prev => prev ? { ...prev, ...data } : null);
      } else {
        await fetchBank();
      }
      toast.success('Banque modifiée avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la modification');
    }
  };
// Handler to add a new service to the bank, which calls the API and updates the local state or refetches the bank details after a successful addition, with error handling
  const handleAddService = async (data: CreateServiceRequest) => {
  try {
    const updatedBank = await addService(bankId, data);
    setShowServiceForm(false);
    
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && updatedBank) {
      // Puisque addService renvoie la banque, on remplace directement l'état !
      setBank(updatedBank as Bank); 
    } else {
      await fetchBank();
    }
    
    toast.success('Service ajouté avec succès !');
  } catch (err: unknown) {
    const error = err as Error;
    setError(error?.message || "Erreur lors de l'ajout du service");
  }
};
  const toggleService = (key: string) => {
    setServices(prev => prev.map(service =>
      service.key === key ? { ...service, selected: !service.selected } : service
    ));
  };

  const handleServiceChange = (key: string, field: 'code' | 'optionDigit' | 'position' | 'menuLevelId', value: string) => {
    setServices(prev => prev.map(service =>
      service.key === key ? { ...service, [field]: value } : service
    ));
  };
// Handler to save the selected services for the bank, which determines which services to add or delete based on the current selection and calls the respective API endpoints, with error handling and loading state management
  const handleSaveServices = async () => {
    if (!bank) return;
    const invalid = services.find(service =>
      service.selected && (!service.optionDigit || !service.position || !service.menuLevelId)
    );
    if (invalid) {
      setError('Veuillez renseigner Option, Position et Niveau pour les services selectionnes.');
      return;
    }
    try {
      setSavingServices(true);
      const existingByLabel = new Map(
        (bank.services || []).map(item => [item.label, item])
      );
      const toDelete: string[] = [];
      const toAdd: CreateServiceRequest[] = [];

      services.forEach(service => {
        const existing = existingByLabel.get(service.label);
        if (!service.selected) {
          if (existing?.id) toDelete.push(String(existing.id));
          return;
        }
        const payload: CreateServiceRequest = {
          label: service.label,
          ...(service.code && { code: service.code }),
          optionDigit: Number(service.optionDigit),
          position: Number(service.position),
          menuLevelId: Number(service.menuLevelId),
        };
        if (!existing) {
          toAdd.push(payload);
          return;
        }
        const hasChanged =
          existing.optionDigit !== Number(service.optionDigit) ||
          existing.position !== Number(service.position) ||
          existing.menuLevelId !== Number(service.menuLevelId) ||
          (existing.code || '') !== (service.code || '');
        if (hasChanged && existing.id) {
          toDelete.push(String(existing.id));
          toAdd.push(payload);
        }
      });

      for (const serviceId of toDelete) {
        await deleteService(bankId, serviceId);
      }
      for (const payload of toAdd) {
        await addService(bankId, payload);
      }
      await fetchBank();
      toast.success('Services mis a jour avec succes !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Erreur lors de la mise a jour des services');
    } finally {
      setSavingServices(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-primary animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <p className="text-gray-600">Banque introuvable</p>
      </div>
    );
  }

  return (
    <>
      {showEditForm && (
        <BankForm
          bank={bank}
          onSubmit={async (data) => await handleUpdate(data as UpdateBankRequest)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
      {showServiceForm && (
        <ServiceForm
          onSubmit={handleAddService}
          onCancel={() => setShowServiceForm(false)}
        />
      )}
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
            <h1 className="text-3xl font-bold text-gray-900">{bank.bankName}</h1>
            <p className="font-mono text-gray-600 mt-1">{bank.bankAlias}</p>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-600 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* MAIN INFORMATION */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Informations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nom</p>
              <p className="font-medium text-gray-900">{bank.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Alias</p>
              <p className="font-mono font-medium text-gray-900">{bank.bankAlias}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Identifiant connecteur</p>
              <p className="font-medium text-gray-900">{bank.bankUsername}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Version</p>
              <p className="font-medium text-gray-900">{bank.version || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Longueur compte</p>
              <p className="font-medium text-gray-900">
                {bank.accountFormat
                  ? bank.accountFormat
                  : (bank.minValue || bank.maxValue)
                    ? `${bank.minValue || '—'} — ${bank.maxValue || '—'}`
                    : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Catégorie</p>
              <p className="font-medium text-gray-900">{bank.bankCategory}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Spécification</p>
              <p className="font-medium text-gray-900">{bank.bankSpecification}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Validité OTP</p>
              <p className="font-medium text-gray-900">
                {bank.otpValidity ? `${bank.otpValidity} secondes` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Seuil mini-relevé</p>
              <p className="font-medium text-gray-900">{bank.miniStatementTreshold || '—'}</p>
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">URLs des services</h2>
          <div className="space-y-4">
            {[
              { label: 'URL Token', value: bank.bankTokenUrl },
              { label: 'URL Solde', value: bank.bankBalanceEnquiryUrl },
              { label: 'URL Banque → Wallet', value: bank.bankToWalletTransferUrl },
              { label: 'URL Wallet → Banque', value: bank.walletToBankTransferUrl },
              { label: 'URL Banque → Banque', value: bank.bankToBankTransferUrl },
              { label: 'URL Mini-relevé', value: bank.bankMiniStatementUrl },
              { label: 'URL Frais', value: bank.bankFeesUrl },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4 py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm text-gray-500 w-40 shrink-0">{label}</p>
                <p className="font-mono text-sm text-gray-900 break-all">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SERVICES USSD */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Services USSD ({bank.services?.length || 0})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveServices}
                disabled={savingServices}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.key} className="p-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={service.selected}
                      onChange={() => toggleService(service.key)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {service.label}
                  </label>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-red-600 mb-1">
                        Option <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={service.optionDigit}
                        onChange={(e) => handleServiceChange(service.key, 'optionDigit', e.target.value)}
                        required={service.selected}
                        disabled={!service.selected}
                        min={1}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-red-600 mb-1">
                        Position <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={service.position}
                        onChange={(e) => handleServiceChange(service.key, 'position', e.target.value)}
                        required={service.selected}
                        disabled={!service.selected}
                        min={1}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Niveau <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={service.menuLevelId}
                        onChange={(e) => handleServiceChange(service.key, 'menuLevelId', e.target.value)}
                        required={service.selected}
                        disabled={!service.selected}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={service.code}
                        onChange={(e) => handleServiceChange(service.key, 'code', e.target.value)}
                        disabled={!service.selected}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}