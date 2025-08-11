'use client';

import { MantineProvider, AppShell } from '@mantine/core';
import '@mantine/core/styles.css';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider>
      <AuthProvider>
        <AppShell
          header={{ height: 60 }}
          padding="md"
        >
          <Navigation />
          <AppShell.Main>
            {children}
          </AppShell.Main>
        </AppShell>
      </AuthProvider>
    </MantineProvider>
  );
} 