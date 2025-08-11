'use client';

import { Container, Title, Text, Stack, Card, Group, Button } from '@mantine/core';
import { IconMail, IconFileTypePdf, IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <Container size="lg" py="xl">
        <Stack gap="xl" ta="center">
          <Title order={1} size="3rem" c="blue">
            Hypothesis and Idea Business Solution Limited
          </Title>
          
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Manage your email and PDF configurations in one centralized platform. 
            Configure SMTP servers for email delivery and set up PDF generation services.
          </Text>

          <Group justify="center" gap="xl" mt="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder w={300}>
              <Stack gap="md" ta="center">
                <IconMail size={64} color="var(--mantine-color-blue-6)" />
                <Title order={3}>SMTP Configuration</Title>
                <Text size="sm" c="dimmed">
                  Configure and manage SMTP servers for email delivery. 
                  Set up authentication tokens and test your configurations.
                </Text>
                <Button
                  variant="light"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => router.push('/smtp')}
                >
                  Manage SMTP
                </Button>
              </Stack>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder w={300}>
              <Stack gap="md" ta="center">
                <IconFileTypePdf size={64} color="var(--mantine-color-red-6)" />
                <Title order={3}>PDF Configuration</Title>
                <Text size="sm" c="dimmed">
                  Configure PDF generation services with IP whitelisting 
                  and authentication tokens for secure access.
                </Text>
                <Button
                  variant="light"
                  color="red"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => router.push('/pdf')}
                >
                  Manage PDF
                </Button>
              </Stack>
            </Card>
          </Group>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}
