"use client";

import { Container, Title, Card, Text, Group, Button, Stack } from "@mantine/core";
import { IconKey } from "@tabler/icons-react";
import { useState } from "react";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    return (
        <Container size="md" py="xl">
            <Title order={2} mb="xl">Profile</Title>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                    <div>
                        <Text size="sm" c="dimmed" mb={4}>Name</Text>
                        <Text fw={500}>{session?.user?.name || "Not set"}</Text>
                    </div>
                    <div>
                        <Text size="sm" c="dimmed" mb={4}>Email</Text>
                        <Text fw={500}>{session?.user?.email || "Not set"}</Text>
                    </div>
                    <div>
                        <Text size="sm" c="dimmed" mb={4}>Role</Text>
                        <Text fw={500}>{session?.user?.isAdmin ? "Admin" : "User"}</Text>
                    </div>
                    <Group mt="md">
                        <Button
                            leftSection={<IconKey size={16} />}
                            onClick={() => setChangePasswordModalOpen(true)}
                        >
                            Change Password
                        </Button>
                    </Group>
                </Stack>
            </Card>

            <ChangePasswordModal
                opened={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />
        </Container>
    );
}

