import { Group, Title, Container } from '@mantine/core';
import { LogoutButton } from '@/components/LogoutButton';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <Container size="lg">
            <header style={{ padding: '20px 0', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                <Group justify="space-between">
                    <Title order={3}>Email Portal</Title>
                    <LogoutButton />
                </Group>
            </header>
            <main>{children}</main>
        </Container>
    );
}
