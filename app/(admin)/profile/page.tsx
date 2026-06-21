'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Shield, Calendar, ArrowLeft } from 'lucide-react';

type Profile = { name: string; role: string; since: string; };

const PROFILE_STORAGE_KEY = 'profile';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const memberSince = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Profile;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(parsed);
        return;
      } catch {
        // Ignore parse errors
      }
    }
    const fallback = {
      name: 'Utilisateur',
      role: 'Administrateur',
      since: new Date().toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
    };
    setProfile(fallback);
  }, []);

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-900 hover:underline font-bold text-sm"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <UserCircle size={48} strokeWidth={1.2} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{profile.name}</p>
            <span className="inline-flex mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200">
              <label className="text-xs font-semibold text-gray-500">Nom complet</label>
              <p className="mt-2 text-gray-900 font-medium">{profile.name}</p>
            </div>
            <div className="p-4">
              <label className="text-xs font-semibold text-gray-500">Rôle</label>
              <p className="mt-2 text-gray-900 font-medium">{profile.role}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <Shield size={16} className="text-gray-400" />
            <span>{profile.role}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span>Membre depuis {memberSince}</span>
          </div>
        </div>
      </div>
    </div>
  );
}