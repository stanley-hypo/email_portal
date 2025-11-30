"use client";

import { Container, Title, Group, Button, Text, Loader, Center } from "@mantine/core";
import { UserTable } from "./components/UserTable";
import { CreateUserModal } from "./components/CreateUserModal";
import { useState, useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session && !session.user?.isAdmin) {
            router.push("/portal/users/error");
            return;
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <Container size="xl" py="xl">
                <Center>
                    <Loader size="lg" />
                </Center>
            </Container>
        );
    }

    if (!session?.user?.isAdmin) {
        return null; // Will redirect
    }

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
