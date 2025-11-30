import { Container, Title, SimpleGrid, Card, Text, ThemeIcon, Group } from '@mantine/core';
import { IconMail, IconFileTypePdf } from '@tabler/icons-react';
import Link from 'next/link';

export default function PortalPage() {
    return (
        <Container size="lg" py="xl">
            <Title order={1} mb="xl" ta="center">Portal Dashboard</Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Card shadow="sm" padding="lg" radius="md" component={Link} href="/smtp" withBorder>
                    <Group mb="xs">
                        <ThemeIcon size="xl" color="blue" variant="light">
                            <IconMail size={24} />
                        </ThemeIcon>
                        <Text fw={500} size="lg">SMTP Manager</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                        Manage SMTP configurations, authentication tokens, and email settings.
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" component={Link} href="/pdf" withBorder>
                    <Group mb="xs">
                        <ThemeIcon size="xl" color="red" variant="light">
                            <IconFileTypePdf size={24} />
                        </ThemeIcon>
                        <Text fw={500} size="lg">PDF Manager</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                        Manage PDF generation settings, IP whitelists, and access tokens.
                    </Text>
                </Card>
            </SimpleGrid>
        </Container>
    );
}
