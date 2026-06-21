'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { login } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { setToken, isTokenExpired, removeToken } from '@/lib/tokenUtils';
import type { AxiosError } from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const PROFILE_STORAGE_KEY = 'profile';

  const extractToken = (payload: unknown): string | undefined => {
    if (!payload || typeof payload !== 'object') return undefined;
    const data = payload as Record<string, unknown>;
    const nestedData = data.data as Record<string, unknown> | undefined;
    const rawToken =
      (data.token as string | undefined) ??
      (data.accessToken as string | undefined) ??
      (nestedData?.token as string | undefined) ??
      (nestedData?.accessToken as string | undefined);

    if (!rawToken) return undefined;
    return rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
  };

  const buildMockProfile = (rawUsername: string) => {
    const trimmed = rawUsername.trim();
    const email = trimmed.includes('@') ? trimmed : `${trimmed}@example.com`;
    const since = new Date().toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    return {
      name: trimmed || 'Utilisateur',
      email,
      role: 'Administrateur',
      since,
    };
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && isTokenExpired(token)) {
      removeToken();
      return;
    }
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(username, password);
      const token = extractToken(response);
      if (token) {
        setToken(token, 1);
        localStorage.setItem('token', token);
      } else {
        setError('Token manquant dans la reponse du serveur.');
        return;
      }
      if (typeof window !== 'undefined') {
        const profile = buildMockProfile(username);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      }
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white">
      <div
        className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 py-8 lg:py-0"
        style={{ backgroundColor: '#FFD100' }}
      >
        <Image
          src="/YAS3.png"
          alt="Logo"
          width={60}
          height={60}
          className="mb-8"
        />
        <h1
          className="text-2xl md:text-3xl font-bold mb-2 text-center"
          style={{ color: '#00377D' }}
        >
          Bienvenue !
        </h1>
        <p
          className="text-sm mb-8 text-center"
          style={{ color: '#00377D' }}
        >
          Connectez-vous pour accéder à votre espace
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-sm" autoComplete="off">
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
              style={{ color: '#00377D' }}
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 border border-primary rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: '#00377D' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 border border-primary rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-primary"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 bg-white flex-col justify-center items-center px-6 md:px-12 py-8">
        <Image
          src="/auth.png"
          alt="Security illustration"
          width={300}
          height={300}
          className="mb-8 max-w-full"
        />
        <h2 className="text-xl md:text-2xl font-bold text-black mb-2 text-center">
          Gérez votre entreprise efficacement
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Accédez à tous vos outils en un seul endroit
        </p>
      </div>
    </div>
  );
}