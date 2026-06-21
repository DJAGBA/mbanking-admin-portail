import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, CheckCircle2 } from 'lucide-react';
import { getUsers } from '@/services/users.service';
import { UserData } from '@/src/types/user';
import { Pagination } from '@/components/paginations';
// Component for the multi-step wizard to declare a new URL limit and assign it to users with specific quotas
const USERS_PER_PAGE = 5;
export function DeclareUrlUserWizard({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: {
    url: string;
    users: UserData[];
    pointsPerMinute: number;
    pointsPerHour: number;
    pointsPerDay?: number;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(USERS_PER_PAGE);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ url: '',
    pointsPerMinute: '',
    pointsPerHour: '',
    pointsPerDay: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(1, 100);
        const items = response?.data?.items ?? [];
        setUsers(items);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [step]);

  useEffect(() => {
    setUserPage(1);
  }, [searchTerm]);

  const filteredUsers = useMemo(() =>
    users.filter(u => u.active && (
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )), [users, searchTerm]);

  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage
  );
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isUserStep = step === 2;
  const isQuotaStep = step === 3;
  const isLastStep = step === 4;

  const nextStep = () => {
    if (step === 1 && !formData.url) {
      setError("L'URL est obligatoire.");
      return;
    }
    if (isUserStep && selectedUsers.length === 0) {
      setError('Veuillez sélectionner au moins un utilisateur actif.');
      return;
    }
    if (isQuotaStep && (!formData.pointsPerMinute || !formData.pointsPerHour)) {
      setError('Les quotas par minute et par heure sont obligatoires.');
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleUserToggle = (user: UserData) => {
    setSelectedUsers(prev =>
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        url: formData.url,
        users: selectedUsers,
        pointsPerMinute: Number(formData.pointsPerMinute),
        pointsPerHour: Number(formData.pointsPerHour),
        pointsPerDay: formData.pointsPerDay ? Number(formData.pointsPerDay) : undefined,
      };
      await onSubmit(payload);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e?.message || "Erreur lors de la déclaration");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-white shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Déclarer une URL</h2>
              <p className="text-sm text-gray-500 font-medium">Nouvelle déclaration</p>
            </div>
            <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex flex-col gap-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-gray-100'}`} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${s === step ? 'text-primary' : 'text-gray-400'}`}>
                  {s === 1 ? 'URL' : s === 2 ? 'Utilisateurs' : s === 3 ? 'Quotas' : 'Résumé'}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Contenu scrollable */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">{error}</div>
          )}
          {/* Étape 1 — Déclaration URL */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                URL de l'endpoint <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                autoComplete="off"
                required
                placeholder="ex: /mpay-debit/v1/process"
                pattern="^/[a-z0-9-]+(?:/[a-z0-9-]+)*$"
                title="Format attendu: /segment/segment, avec lettres minuscules, chiffres et tirets"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary bg-white font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Path complet de l'endpoint proxifié dans la gateway
              </p>
            </div>
          )}
          {/* Étape 2 — Sélection utilisateurs actifs */}
          {isUserStep && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                Sélectionner les utilisateurs actifs
              </label>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900"
              />
              {usersLoading ? (
                <div className="py-8 text-center text-gray-500">Chargement des utilisateurs...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">Aucun utilisateur actif trouvé</div>
              ) : (
                <>
                  <div className="border border-gray-200 rounded-xl divide-y bg-gray-50">
                    {paginatedUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleUserToggle(u)}
                        className={`flex items-center p-4 cursor-pointer hover:bg-white transition-all ${selectedUsers.some(su => su.id === u.id) ? 'bg-primary' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 shrink-0 ${selectedUsers.some(su => su.id === u.id) ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                          {selectedUsers.some(su => su.id === u.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    page={userPage}
                    totalPages={totalUserPages}
                    total={filteredUsers.length}
                    limit={usersPerPage}
                    onPageChange={(newPage) => {
                      const boundedPage = Math.min(Math.max(1, newPage), Math.max(1, totalUserPages));
                      setUserPage(boundedPage);
                    }}
                    onLimitChange={(newLimit) => {
                      setUsersPerPage(newLimit);
                      setUserPage(1);
                    }}
                  />
                </>
              )}
            </div>
          )}
          {/* Étape 3 — Quotas */}
          {isQuotaStep && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                    Par minute <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pointsPerMinute"
                    value={formData.pointsPerMinute}
                    onChange={handleChange}
                    min={1}
                    placeholder="10"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                    Par heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pointsPerHour"
                    value={formData.pointsPerHour}
                    onChange={handleChange}
                    min={1}
                    placeholder="500"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Par jour</label>
                  <input
                    type="number"
                    name="pointsPerDay"
                    value={formData.pointsPerDay}
                    onChange={handleChange}
                    min={1}
                    placeholder="Optionnel"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Étape 4 — Résumé */}
          {isLastStep && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Résumé</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">URL</span>
                    <span className="font-bold text-gray-900">{formData.url}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Utilisateurs</span>
                    <span className="font-bold text-gray-900">{selectedUsers.map(u => u.username).join(', ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Par minute</span>
                    <span className="font-bold text-gray-900">{formData.pointsPerMinute}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Par heure</span>
                    <span className="font-bold text-gray-900">{formData.pointsPerHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Par jour</span>
                    <span className="font-bold text-gray-900">{formData.pointsPerDay || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex gap-4 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              Annuler
            </button>
          )}
          {!isLastStep ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-[2] px-8 py-3 bg-primary hover:bg-primary text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] px-8 py-3 bg-primary hover:bg-primary text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Confirmer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
