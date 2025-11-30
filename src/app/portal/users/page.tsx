"use client";

import { Container, Title, Group, Button, Text } from "@mantine/core";
import { UserTable } from "./components/UserTable";
import { CreateUserModal } from "./components/CreateUserModal";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { requireAdmin } from "@/lib/auth-helpers";

export default async function UserManagementPage() {
    await requireAdmin();

    return <UserManagementContent />;
}

function UserManagementContent() {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>User Management</Title>
                    <Text c="dimmed">Manage system users and their permissions</Text>
                </div>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setCreateModalOpen(true)}
                >
                    Add User
                </Button>
            </Group>

            <UserTable />
            <CreateUserModal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} />
        </Container>
    );
}
