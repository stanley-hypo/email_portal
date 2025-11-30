'use client';

import { AppShell, Group, Button, Title } from '@mantine/core';
import { IconMail, IconFileTypePdf, IconHome, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { LogoutButton } from "./LogoutButton";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.isAdmin === true;

  const menuItems = [
    { path: '/', label: 'Home', icon: IconHome },
    { path: '/smtp', label: 'SMTP', icon: IconMail },
    { path: '/pdf', label: 'PDF', icon: IconFileTypePdf },
  ];

  // Add User Management link for admins only
  if (isAdmin) {
    menuItems.push({ path: '/portal/users', label: 'User Management', icon: IconUsers });
  }

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
          {isAuthenticated && <LogoutButton />}
        </Group>
      </Group>
    </AppShell.Header>
  );
}
