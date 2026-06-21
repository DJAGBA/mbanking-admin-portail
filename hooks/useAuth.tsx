'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}
interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return {
        isAuthenticated: !!token && !isTokenExpired(token),
        token: !isTokenExpired(token ?? '') ? token : null,
        isLoading: false,
      };
    }
    return { isAuthenticated: false, token: null, isLoading: true };
  });
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ isAuthenticated: false, token: null, isLoading: false });
    }
  }, []);
  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    setState({ isAuthenticated: true, token, isLoading: false });
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ isAuthenticated: false, token: null, isLoading: false });
  }, []);
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
// Helper
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}