'use client';

import { AppShell, Group, Button, Title } from '@mantine/core';
import { IconMail, IconFileTypePdf, IconHome, IconLogout } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Home', icon: IconHome },
    { path: '/smtp', label: 'SMTP', icon: IconMail },
    { path: '/pdf', label: 'PDF', icon: IconFileTypePdf },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Title order={3} c="blue">
          API Portal
        </Title>
        <Group gap="xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={pathname === item.path ? 'filled' : 'light'}
                color="blue"
                leftSection={<Icon size={16} />}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </Button>
            );
          })}
          {isAuthenticated && (
            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Group>
      </Group>
    </AppShell.Header>
  );
}
