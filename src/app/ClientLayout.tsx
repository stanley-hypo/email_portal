'use client';

import { MantineProvider, AppShell } from '@mantine/core';
import '@mantine/core/styles.css';
import Navigation from '@/components/Navigation';
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider>
      <SessionProvider>
        <AppShell
          header={{ height: 60 }}
          padding="md"
        >
          <Navigation />
          <AppShell.Main>
            {children}
          </AppShell.Main>
        </AppShell>
      </SessionProvider>
    </MantineProvider>
  );
} 