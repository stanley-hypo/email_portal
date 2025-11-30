'use client';

import { MantineProvider, AppShell } from '@mantine/core';
import '@mantine/core/styles.css';
import Navigation from '@/components/Navigation';
import { SessionProvider, useSession } from "next-auth/react";

function AppContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <AppShell
      header={isAuthenticated ? { height: 60 } : undefined}
      padding="md"
    >
      {isAuthenticated && <Navigation />}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider>
      <SessionProvider>
        <AppContent>{children}</AppContent>
      </SessionProvider>
    </MantineProvider>
  );
} 