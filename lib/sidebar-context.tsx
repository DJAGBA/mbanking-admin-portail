'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isHydrated: boolean;
}
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
export function SidebarProvider({ children }: { readonly children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  // Restore preference after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCollapsed(JSON.parse(saved));
      }
    } catch {
      // Corrupted value, keep the default
      localStorage.removeItem('sidebar-collapsed');
    }
    setIsHydrated(true);
  }, []);

  const handleSetCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    } catch {
      // localStorage full or unavailable
    }
  }, []);

  const value = useMemo(
    () => ({ isCollapsed, setIsCollapsed: handleSetCollapsed, isHydrated }),
    [isCollapsed, isHydrated, handleSetCollapsed]
  );
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}