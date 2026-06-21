'use client';

import { useState } from 'react';
import { Bank, CreateBankRequest, UpdateBankRequest } from '@/src/types/bank';
import { X } from 'lucide-react';
type BankFormProps = {
  bank?: Bank | null;
  onSubmit: (data: CreateBankRequest | UpdateBankRequest) => Promise<void>;
  onCancel: () => void;
};
// Component for the form to create or edit a partner bank, with fields for bank details and service URLs, including validation and error handling
export function BankForm({ bank, onSubmit, onCancel }: BankFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bankName: bank?.bankName || '',
    bankAlias: bank?.bankAlias || '',
    bankUsername: bank?.bankUsername || '',
    bankPassword: '',
    minValue: bank?.minValue || '',
    maxValue: bank?.maxValue || '',
    accountFormat: bank?.accountFormat || '',
    bankCategory: bank?.bankCategory?.toString() || '',
    bankSpecification: bank?.bankSpecification || 'New',
    version: bank?.version || 'v1',
    redirectIp: bank?.redirectIp || '',
    bankTokenUrl: bank?.bankTokenUrl || '',
    bankAccountLinkRequestUrl: bank?.bankAccountLinkRequestUrl || '',
    bankAccountLinkValidateUrl: bank?.bankAccountLinkValidateUrl || '',
    bankAccountListUrl: bank?.bankAccountListUrl || '',
    bankBalanceEnquiryUrl: bank?.bankBalanceEnquiryUrl || '',
    bankCheckStatusUrl: bank?.bankCheckStatusUrl || '',
    bankFailedNotifUrl: bank?.bankFailedNotifUrl || '',
    bankToWalletTransferUrl: bank?.bankToWalletTransferUrl || '',
    walletToBankTransferUrl: bank?.walletToBankTransferUrl || '',
    bankToBankTransferUrl: bank?.bankToBankTransferUrl || '',
    bankMiniStatementUrl: bank?.bankMiniStatementUrl || '',
    bankFeesUrl: bank?.bankFeesUrl || '',
    miniStatementTreshold: bank?.miniStatementTreshold?.toString() || '',
    otpValidity: bank?.otpValidity?.toString() || '',
  });

  // Catalog of available services to select when creating a new bank, with mapping to form fields for code, option digit, position, and menu level
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
// State to manage the list of services in the form, initialized based on the existing bank's services if editing, or from the catalog if creating a new bank
  const [services, setServices] = useState<ServiceFormRow[]>(() =>
    serviceCatalog.map(service => {
      const existing = bank?.services?.find(s => s.label === service.label);
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
 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
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
  // Handler for form submission to create or update a bank, with validation of required fields and transformation of form data into the API request format, including error handling and loading state management
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedServices = services.filter(service => service.selected);

      const data: CreateBankRequest | UpdateBankRequest = {
        bankName: formData.bankName,
        bankAlias: formData.bankAlias,
        bankUsername: formData.bankUsername,
        ...(formData.bankPassword && { bankPassword: formData.bankPassword }),
        minValue: formData.minValue,
        maxValue: formData.maxValue,
        ...(formData.accountFormat && { accountFormat: formData.accountFormat }),
        bankCategory: Number(formData.bankCategory),
        ...(formData.bankSpecification && { bankSpecification: formData.bankSpecification }),
        ...(formData.version && { version: formData.version }),
        ...(formData.redirectIp && { redirectIp: formData.redirectIp }),
        ...(formData.bankTokenUrl && { bankTokenUrl: formData.bankTokenUrl }),
        ...(formData.bankAccountLinkRequestUrl && { bankAccountLinkRequestUrl: formData.bankAccountLinkRequestUrl }),
        ...(formData.bankAccountLinkValidateUrl && { bankAccountLinkValidateUrl: formData.bankAccountLinkValidateUrl }),
        ...(formData.bankAccountListUrl && { bankAccountListUrl: formData.bankAccountListUrl }),
        ...(formData.bankBalanceEnquiryUrl && { bankBalanceEnquiryUrl: formData.bankBalanceEnquiryUrl }),
        ...(formData.bankCheckStatusUrl && { bankCheckStatusUrl: formData.bankCheckStatusUrl }),
        ...(formData.bankFailedNotifUrl && { bankFailedNotifUrl: formData.bankFailedNotifUrl }),
        ...(formData.bankToWalletTransferUrl && { bankToWalletTransferUrl: formData.bankToWalletTransferUrl }),
        ...(formData.walletToBankTransferUrl && { walletToBankTransferUrl: formData.walletToBankTransferUrl }),
        ...(formData.bankToBankTransferUrl && { bankToBankTransferUrl: formData.bankToBankTransferUrl }),
        ...(formData.bankMiniStatementUrl && { bankMiniStatementUrl: formData.bankMiniStatementUrl }),
        ...(formData.bankFeesUrl && { bankFeesUrl: formData.bankFeesUrl }),
        ...(formData.miniStatementTreshold && { miniStatementTreshold: Number(formData.miniStatementTreshold) }),
        ...(formData.otpValidity && { otpValidity: Number(formData.otpValidity) }),
        ...(!bank && selectedServices.length > 0 && {
          services: selectedServices.map(service => ({
            label: service.label,
            ...(service.code && { code: service.code }),
            optionDigit: Number(service.optionDigit),
            position: Number(service.position),
            menuLevelId: Number(service.menuLevelId),
          }))
        }),
      };

      await onSubmit(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };
// Catalog of placeholder URLs for the service endpoints, used to guide the user when filling out the form for creating or editing a bank
  const urlPlaceholders: Record<string, string> = {
    bankTokenUrl: 'https://connector.example.tg/api/mbanking/auth',
    bankAccountLinkRequestUrl: 'https://connector.example.tg/api/subscription/account-link-request',
    bankAccountLinkValidateUrl: 'https://connector.example.tg/api/subscription/account-link-validate',
    bankAccountListUrl: 'https://connector.example.tg/api/subscription/account-list',
    bankBalanceEnquiryUrl: 'https://connector.example.tg/api/mbanking/balance-enquiry',
    bankCheckStatusUrl: 'https://connector.example.tg/api/mbanking/check-status',
    bankFailedNotifUrl: 'https://connector.example.tg/api/mbanking/transfer/send-b2w-failed-notif',
    bankToWalletTransferUrl: 'https://connector.example.tg/api/mbanking/transfer/b2w-transfer',
    walletToBankTransferUrl: 'https://connector.example.tg/api/mbanking/transfer/w2b-transfer',
    bankToBankTransferUrl: 'https://connector.example.tg/api/mbanking/transfer/b2b-transfer',
    bankMiniStatementUrl: 'https://connector.example.tg/api/mbanking/transfer/mini-statement',
    bankFeesUrl: 'https://connector.example.tg/api/mbanking/transfer/get-bank-fees',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {bank ? 'Modifier la banque' : 'Créer une banque'}
          </h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {/* MAIN INFORMATION */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Informations principales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom de la banque <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Nom complet de la banque"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Alias <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankAlias"
                  value={formData.bankAlias}
                  placeholder="Alias de la banque"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Identifiant connecteur <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankUsername"
                  value={formData.bankUsername}
                  onChange={handleChange}
                  placeholder="Identifiant du connecteur"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mot de passe {!bank && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  name="bankPassword"
                  value={formData.bankPassword}
                  onChange={handleChange}
                  placeholder={' mots de passe'}
                  required={!bank}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Longueur min compte <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="minValue"
                  value={formData.minValue}
                  onChange={handleChange}
                  placeholder="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Longueur max compte <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="maxValue"
                  value={formData.maxValue}
                  onChange={handleChange}
                  placeholder="10"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                   bank Catégorie <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="bankCategory"
                  value={formData.bankCategory}
                  onChange={handleChange}
                  required
                  min={1}
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
             <div>
  <label className="block text-sm font-semibold text-gray-900 mb-2">
    Version
  </label>

  <select
    name="version"
    value={formData.version}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
  >
    <option value="v1">v1</option>
    <option value="v2">v2</option>
  </select>
</div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Format compte</label>
                <input
                  type="text"
                  name="accountFormat"
                  value={formData.accountFormat}
                  onChange={handleChange}
                  placeholder="Format du numéro de compte"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
  <label className="block text-sm font-semibold text-gray-900 mb-2">
    Bank Specification
  </label>

  <select
    name="bankSpecification"
    value={formData.bankSpecification}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
  >
    <option value="">Sélectionner</option>
    <option value="new">new</option>
    <option value="old">old</option>
    <option value="OCECCP">OCECCP</option>
  </select>
           </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">IP de redirection</label>
                <input
                  type="text"
                  name="redirectIp"
                  value={formData.redirectIp}
                  onChange={handleChange}
                  placeholder="Adresse IP de redirection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
            </div>
          </div>
          {/* URLs */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">URLs des services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'bankTokenUrl', label: 'URL Token' },
                { name: 'bankAccountLinkRequestUrl', label: 'URL Account Link Request' },
                { name: 'bankAccountLinkValidateUrl', label: 'URL Account Link Validate' },
                { name: 'bankAccountListUrl', label: 'URL Account List' },
                { name: 'bankBalanceEnquiryUrl', label: 'URL Solde' },
                { name: 'bankCheckStatusUrl', label: 'URL Check Status' },
                { name: 'bankFailedNotifUrl', label: 'URL Failed Notif' },
                { name: 'bankToWalletTransferUrl', label: <>URL Banque → Wallet <span className="text-red-600">*</span></>, required: true                 },
                { name: 'walletToBankTransferUrl', label: <>URL Wallet → Banque <span className="text-red-600">*</span></>,  required: true},
                { name: 'bankToBankTransferUrl',label: <>URL Banque → Banque <span className="text-red-600">*</span></>,required: true},
                { name: 'bankMiniStatementUrl', label: 'URL Mini-relevé' },
                { name: 'bankFeesUrl', label: 'URL Frais' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
                  <input
                    type="url"
                    name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={urlPlaceholders[name as keyof typeof urlPlaceholders] || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Seuil mini-relevé <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  name="miniStatementTreshold"
                  value={formData.miniStatementTreshold}
                  onChange={handleChange}
                  required
                  placeholder="Montant minimum pour mini-relevé"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Validité OTP (secondes) <span className="text-red-600">*</span>

                </label>
                <input
                  type="number"
                  name="otpValidity"
                  value={formData.otpValidity}
                  onChange={handleChange}
                  required
                  placeholder="Durée de validité de l'OTP en secondes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
            </div>
          </div>

          {/* SERVICES — only at creation*/}
          {!bank && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Services USSD</h3>
              </div>
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
                          <option value="4">4</option>
                          <option value="5">5</option>
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
          )}
          {/* FOOTER */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg bg-primary hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : bank ? 'Modifier' : 'Créer'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}