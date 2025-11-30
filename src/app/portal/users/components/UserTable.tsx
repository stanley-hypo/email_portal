"use client";

import { Table, Group, Text, ActionIcon, Badge, Menu, LoadingOverlay } from "@mantine/core";
import { IconDots, IconPencil, IconTrash, IconKey } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "@/app/actions/user";
import { notifications } from "@mantine/notifications";
import { EditUserModal } from "./EditUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { modals } from "@mantine/modals";

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: Date | null;
    isAdmin: boolean;
}

export function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const result = await getUsers();
        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            notifications.show({
                title: "Error",
                message: result.error || "Failed to fetch users",
                color: "red",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (user: User) => {
        modals.openConfirmModal({
            title: "Delete User",
            children: (
                <Text size="sm">
                    Are you sure you want to delete <b>{user.name || user.email}</b>? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: "Delete User", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                const result = await deleteUser(user.id);
                if (result.success) {
                    notifications.show({
                        title: "Success",
                        message: "User deleted successfully",
                        color: "green",
                    });
                    fetchUsers();
                } else {
                    notifications.show({
                        title: "Error",
                        message: result.error || "Failed to delete user",
                        color: "red",
                    });
                }
            },
        });
    };

    const rows = users.map((user) => (
        <Table.Tr key={user.id}>
            <Table.Td>
                <Group gap="sm">
                    <div>
                        <Text size="sm" fw={500}>
                            {user.name || "No Name"}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {user.email}
                        </Text>
                    </div>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge color={user.isAdmin ? "blue" : "gray"} variant="light">
                    {user.isAdmin ? "Admin" : "User"}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Group gap={0} justify="flex-end">
                    <Menu position="bottom-end" withArrow>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconPencil size={14} />}
                                onClick={() => setEditingUser(user)}
                            >
                                Edit User
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconKey size={14} />}
                                onClick={() => setResettingPasswordUser(user)}
                            >
                                Reset Password
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(user)}
                            >
                                Delete User
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <div style={{ position: "relative", minHeight: 200 }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <Table verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    opened={!!editingUser}
                    onClose={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}

            {resettingPasswordUser && (
                <ResetPasswordModal
                    user={resettingPasswordUser}
                    opened={!!resettingPasswordUser}
                    onClose={() => {
                        setResettingPasswordUser(null);
                    }}
                />
            )}
        </>
    );
}
