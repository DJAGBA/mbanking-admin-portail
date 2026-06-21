'use client';

import React, { useState, SyntheticEvent, useEffect } from 'react';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/src/types/user';
import { X, AlertCircle, Loader2 } from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface UserFormProps {
  /** Existing user data if editing, or null/undefined if creating a new user */
  readonly user?: UserData | null;
  /** Async callback fired when the form submission passes client-side processing */
  readonly onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  /** Callback to close the modal or cancel the current action */
  readonly onCancel: () => void;
  parentError?: string | null;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// ==========================================
// REUSABLE INPUT COMPONENT
// ==========================================

const InputField = ({ label, error, required, id, className, ...props }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id || props.name} className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input
      id={id || props.name}
      required={required}
      autoComplete={props.autoComplete ?? 'off'}
      {...props}
      className={`w-full px-4 py-2 border rounded-lg transition-all focus:ring-2 focus:outline-none ${
        error
          ? 'border-red-600 focus:ring-red-200'
          : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
      } ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'} ${className || ''}`}
    />
    {error && (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// ==========================================
// MAIN USERFORM COMPONENT
// ==========================================

export function UserForm({ user, onSubmit, onCancel, parentError }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Omit<CreateUserRequest, 'operation'> & { operation: string[] }>({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
    version: user?.version || '',
    operation: user?.operation ? user.operation.split(';') : [],
    callbackUrl: user?.callbackUrl || '',
    corporateMomoAccount: user?.corporateMomoAccount || '',
    corporateMomoCode: user?.corporateMomoCode || '',
    momoAlias: user?.momoAlias || '',
    active: user?.active ?? true,
  });

  // Global listener for the 'Escape' key to dismiss the modal safely
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel, loading]);

  /**
   * Universal change handler for standard textual inputs and top-level boolean checkboxes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors(({ [name]: _, ...rest }) => rest);
    }
  };

  /**
   * Intercepts standard form submission, converts local arrays into formats expected by the API
   */
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const u = {
        ...formData,
        operation: formData.operation.join(';'),
      } as unknown as CreateUserRequest;

      const { username, ...payload } = u;

      await onSubmit(user ? payload as UpdateUserRequest : u);

    } catch (err: unknown) {
      const error = err as Error;
      let msg = error?.message || 'Une erreur est survenue lors de l\'enregistrement';

      // Essayer de parser l'erreur si c'est du JSON
      if (msg.startsWith('{')) {
        try {
          const parsed = JSON.parse(msg);
          
          // Vérifier si c'est une erreur de conflit (username déjà pris)
          if (parsed?.status?.code === 4090 || parsed?.status?.message === 'Conflict') {
            const username = formData.username || 'cet utilisateur';
            setError(`Le nom d'utilisateur "${username}" est déjà pris. Veuillez en choisir un autre.`);
            // Mettre en évidence le champ username
            setFieldErrors({ username: 'Ce nom d\'utilisateur est déjà utilisé' });
            return;
          }
          
          // Si l'API renvoie des erreurs de validation de champ
          if (parsed && typeof parsed === 'object') {
            // Vérifier si c'est un objet d'erreurs de champ
            const hasFieldErrors = Object.keys(parsed).some(key => 
              typeof parsed[key] === 'string' && key !== 'status' && key !== 'message'
            );
            
            if (hasFieldErrors) {
              setFieldErrors(parsed);
              return;
            }
            
            // Sinon, afficher la description de l'erreur
            if (parsed.status?.description) {
              setError(parsed.status.description);
              return;
            }
          }
        } catch {
          // Parsing failed, fallback gracefully
        }
      }

      // Si l'erreur contient des informations sur le username déjà pris
      if (msg.toLowerCase().includes('username') && msg.toLowerCase().includes('already taken')) {
        setError(`Le nom d'utilisateur "${formData.username}" est déjà pris. Veuillez en choisir un autre.`);
        setFieldErrors({ username: 'Ce nom d\'utilisateur est déjà utilisé' });
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser les erreurs lorsque l'utilisateur change le username
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    // Réinitialiser l'erreur spécifique au username si elle existe
    if (fieldErrors.username) {
      setFieldErrors(({ username: _, ...rest }) => rest);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay backdrop */}
      <div
        style={{ zIndex: 51 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onCancel()}
        aria-hidden="true"
      />

      {/* Centered Modal Content Card */}
      <div className="relative z-60 bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh]">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[95vh]" autoComplete="off">

          {/* Form Modal Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {user ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Container Body */}
          <div className="overflow-y-auto p-6 space-y-8">

            {/* Global API Failure Error Display */}
            {(error || parentError) && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex gap-3 rounded-r-lg">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error || parentError}</span>
              </div>
            )}

            {/* Core Identity Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nom d'utilisateur"
                name="username"
                required
                maxLength={50}
                value={formData.username}
                onChange={handleUsernameChange} // Utiliser la fonction spécialisée
                disabled={!!user}
                error={fieldErrors.username}
                placeholder="johndoe"
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                required
                maxLength={100}
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                autoComplete="new-email"
                placeholder="john@example.com"
              />
            </div>

            {/* Application Configuration Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nom complet"
                name="name"
                required
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="version" className="text-sm font-semibold text-gray-700">
                  Version <span className="text-red-500">*</span>
                </label>
                <select
                  id="version"
                  name="version"
                  required
                  value={formData.version}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 transition-all focus:ring-2 focus:outline-none ${
                    fieldErrors.version
                      ? 'border-red-600 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                  }`}
                >
                  <option value="" disabled>Sélectionnez une Version</option>
                  <option value="v1">v1</option>
                  <option value="v2">v2</option>
                </select>
                {fieldErrors.version && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.version}
                  </p>
                )}
              </div>

              {/* Operations Authorization Checkboxes Grid */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Operations <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  {['credit', 'debit', 'bankCashIn', 'bankCashOut'].map((op) => {
                    const isChecked = formData.operation.includes(op);
                    return (
                      <label key={op} className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-gray-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setFormData(prev => {
                              const updatedOps = prev.operation.includes(op)
                                ? prev.operation.filter(item => item !== op)
                                : [...prev.operation, op];
                              return { ...prev, operation: updatedOps };
                            });
                            if (fieldErrors.operation) setFieldErrors(({ operation: _, ...rest }) => rest);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="capitalize">{op}</span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.operation && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.operation}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Callback URL"
                  name="callbackUrl"
                  type="url"
                  required
                  maxLength={255}
                  value={formData.callbackUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/callback"
                />
              </div>
            </div>

            {/* Mobile Money Financial Configuration */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">
                MoMo Corporate Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="corporateMomoAccount"
                  name="corporateMomoAccount"
                  maxLength={50}
                  value={formData.corporateMomoAccount}
                  onChange={handleChange}
                  placeholder="corporatemomoaccount"
                />
                <InputField
                  label="corporateMomoCode"
                  name="corporateMomoCode"
                  maxLength={50}
                  value={formData.corporateMomoCode}
                  onChange={handleChange}
                  placeholder="code momo corporate"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="momoAlias"
                    name="momoAlias"
                    required
                    maxLength={50}
                    value={formData.momoAlias}
                    onChange={handleChange}
                    placeholder="Alias momo"
                  />
                </div>
              </div>
            </div>

            {!user && (
              <label className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl cursor-pointer border border-primary hover:bg-primary/20 transition-colors w-fit">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-primary">Activer l'utilisateur</span>
              </label>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="p-6 border-t bg-gray-50 flex gap-3 rounded-b-xl">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 border border-red-600 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {user ? 'Mettre à jour' : 'Créer un utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}