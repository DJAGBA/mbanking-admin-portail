'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { AssignPlanRequest } from '@/src/types/rate-limit';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Check } from 'lucide-react';
import { getUsers } from '@/services/users.service';
import { UserData } from '@/src/types/user';
import { Pagination } from '@/components/paginations';
// Form component for assigning a plan to users, with multi-step navigation and validation
type AssignPlanFormProps = {
  initialPlanName: string;
  onSubmit: (userIds: string[], data: AssignPlanRequest) => Promise<void>;
  onCancel: () => void;
};
// Main component for the assign plan form, handling user selection, configuration, and summary steps
export function AssignPlanForm({ initialPlanName, onSubmit, onCancel }: AssignPlanFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const[limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    planName: initialPlanName,
    customPointsPerMinute: '',
    customPointsPerHour: '',
    customPointsPerDay: '',
    endDate: '',
    durationDays: '1',
    notes: '',
  });
  // Update endDate automatically each time we reach step 2 (config) 
// NOTE: we no longer pre-fill the expiration date here — the expiration is calculated 
// only upon submission and displayed in the summary.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(1, 100);
        if (response?.data?.items) {
          setUsers(response.data.items);
        }
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);
// Calculate the minimum date-time for the expiration field (current time + 1 minute) to prevent past dates
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [step]);
// Handle input changes for all form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
// Toggle user selection in the list when clicked
  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
// Handle navigation to the next step, with validation for user selection in step 1 and expiration date in step 2
  const nextStep = () => {
    if (step === 1 && selectedUserIds.length === 0) {
      setError('Veuillez sélectionner au moins un utilisateur.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };
  const prevStep = () => setStep(prev => prev - 1);
  // FIX: prevent native form submission on each step except the last
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
// Handle form submission for both create and update
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    // Calculates expiration date: from `durationDays` if present, otherwise +100 days
    //  Use the `endDate` from the formData if it was set in the config step, otherwise calculate it based on the duration (default to 1 day)
      const endDate = formData.endDate ? `${formData.endDate}T23:59:59Z` : '';
    try {
      const data: AssignPlanRequest = {
        planName: formData.planName,
        ...(formData.customPointsPerMinute && { customPointsPerMinute: Number(formData.customPointsPerMinute) }),
        ...(formData.customPointsPerHour && { customPointsPerHour: Number(formData.customPointsPerHour) }),
        ...(formData.customPointsPerDay && { customPointsPerDay: Number(formData.customPointsPerDay) }),
        endDate,
        ...(formData.notes && { notes: formData.notes }),
      };

      await onSubmit(selectedUserIds, data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };
// Get the selected user objects based on the selectedUserIds for display in the summary step
  const selectedUsers = users.filter(u => selectedUserIds.includes(String(u.id)));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/*FIX: replaced <form> with <div> to prevent accidental native submits */}
      <div
       className="relative bg-white rounded-2xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col max-h-[95vh]"

        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-white shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Affectation de Plan</h2>
              <p className="text-sm text-gray-500 uppercase font-bold tracking-tighter">Plan : {initialPlanName}</p>
            </div>
            <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex flex-col gap-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-900' : 'bg-gray-100'}`} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${s === step ? 'text-blue-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Sélection' : s === 2 ? 'Config' : 'Résumé'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">{error}</div>
          )}

          {/*Step 1 — User selection */}
{step === 1 && (
  <div className="space-y-4">
    <label className="block text-sm font-semibold text-gray-900">
      Sélectionner les bénéficiaires ({selectedUserIds.length})
    </label>

    {/* Search bar */}
    <input
  type="text"
  placeholder="Rechercher un utilisateur..."
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
 />

    {usersLoading ? (
      <div className="py-8 text-center text-gray-500">
        Chargement des utilisateurs...
      </div>
    ) : (
      <>
        {/* Filtered + paginated list */}
        <div className="border border-gray-200 rounded-xl divide-y bg-gray-50 max-h-64 overflow-y-auto">
          {users
            .filter(user =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice((page - 1) * limit, page * limit) // pagination
            .map((user) => (
              <div
                key={user.id}
                onClick={() => toggleUser(String(user.id))}
                className="flex items-center p-4 cursor-pointer hover:bg-white transition-all"
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center mr-4 shrink-0 ${
                    selectedUserIds.includes(String(user.id))
                      ? 'bg-blue-900 border-blue-900'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {selectedUserIds.includes(String(user.id)) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={Math.ceil(
            users.filter(user =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).length / limit
          )}
          total={users.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </>
    )}
            </div>
                 )}
          {/*Step 2 — Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Quota/min</label>
                  <input type="number" name="customPointsPerMinute" value={formData.customPointsPerMinute} onChange={handleChange} min={1} placeholder="50" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Quota/heure</label>
                  <input type="number" name="customPointsPerHour" value={formData.customPointsPerHour} onChange={handleChange} min={1} placeholder="100" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Quota/jour</label>
                  <input type="number" name="customPointsPerDay" value={formData.customPointsPerDay} onChange={handleChange} min={1} placeholder="1000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900 text-gray-900" />
                </div>
              </div>
            <div className="mt-4 w-48">
                 <label className="block text-sm font-semibold text-gray-900 mb-2">Date d'expiration</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate ? formData.endDate.slice(0, 10) : ''}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                         />
                    </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} maxLength={500} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900 resize-none text-gray-900" placeholder="Raison de l'affectation..." />
                <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
              </div>
            </div>
          )}

          {/*Step 3 — Summary (now rendered correctly) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-900 rounded-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <h3 className="text-lg font-bold text-gray-900">Résumé général</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-mono text-blue-900 font-bold uppercase">{initialPlanName}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="text-gray-600 block mb-2">Utilisateurs ({selectedUserIds.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedUsers.map(u => (
                        <span key={u.id} className="px-2 py-1 bg-blue-900 text-white text-xs rounded-full">{u.username}</span>
                      ))}
                    </div>
                  </div>
                  {(formData.customPointsPerMinute || formData.customPointsPerHour || formData.customPointsPerDay) && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Quotas</span>
                      <span className="text-gray-900 text-right text-xs">
                        {formData.customPointsPerMinute && <span className="block">Min: {formData.customPointsPerMinute}</span>}
                        {formData.customPointsPerHour && <span className="block">H: {formData.customPointsPerHour}</span>}
                        {formData.customPointsPerDay && <span className="block">Jour: {formData.customPointsPerDay}</span>}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Expiration</span>
                    <span className={formData.endDate ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                      {formData.endDate
                        ? new Date(formData.endDate + 'T00:00:00').toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                                    })
                        : 'Permanente'}
                    </span>
                  </div>
                  {formData.notes && (
                    <div className="pb-2">
                      <span className="text-gray-600 block mb-1">Notes</span>
                      <span className="text-gray-900 text-xs italic">{formData.notes}</span>
                    </div>
                  )}
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

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-[2] px-8 py-3 bg-blue-900 hover:bg-blue-900 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            // FIX: confirm button uses onClick instead of type="submit"
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] px-8 py-3 bg-blue-900 hover:bg-blue-900 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Traitement...' : "Confirmer l'envoi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}