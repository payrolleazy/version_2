'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface AppShellContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const value = useMemo<AppShellContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
    }),
    [collapsed]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error('useAppShell must be used inside AppShellProvider');
  }

  return context;
}
