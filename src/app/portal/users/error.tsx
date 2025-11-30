"use client";

import { Container, Title, Text, Button, Stack, Card } from "@mantine/core";
import { IconShieldX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedErrorPage() {
    const router = useRouter();

    return (
        <Container size="md" py="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack align="center" gap="md">
                    <IconShieldX size={64} color="red" />
                    <Title order={2} ta="center">Access Denied</Title>
                    <Text c="dimmed" ta="center" size="lg">
                        You do not have permission to access this page.
                    </Text>
                    <Text c="dimmed" ta="center" size="sm">
                        This page is restricted to administrators only.
                    </Text>
                    <Button
                        onClick={() => router.push("/")}
                        mt="md"
                    >
                        Return to Home
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}

