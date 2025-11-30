"use client";

import { Modal, TextInput, Checkbox, Button, Group, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { updateUser } from "@/app/actions/user";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { zodResolver } from "mantine-form-zod-resolver";
import { UserSchema } from "@/lib/validations/user";

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: Date | null;
    isAdmin: boolean;
}

interface EditUserModalProps {
    user: User;
    opened: boolean;
    onClose: () => void;
}

export function EditUserModal({ user, opened, onClose }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            name: user.name || "",
            email: user.email,
            isAdmin: user.isAdmin,
        },
        validate: zodResolver(UserSchema.omit({ password: true })),
    });

    // Reset form when user changes
    useEffect(() => {
        form.setValues({
            name: user.name || "",
            email: user.email,
            isAdmin: user.isAdmin,
        });
    }, [user]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const result = await updateUser(user.id, values);
        setLoading(false);

        if (result.success) {
            notifications.show({
                title: "Success",
                message: "User updated successfully",
                color: "green",
            });
            onClose();
        } else {
            notifications.show({
                title: "Error",
                message: result.error || "Failed to update user",
                color: "red",
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit User">
            <div style={{ position: "relative" }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Name"
                        placeholder="John Doe"
                        mb="md"
                        {...form.getInputProps("name")}
                    />
                    <TextInput
                        required
                        label="Email"
                        placeholder="john@example.com"
                        mb="md"
                        {...form.getInputProps("email")}
                    />
                    <Checkbox
                        label="Admin Privileges"
                        mb="xl"
                        {...form.getInputProps("isAdmin", { type: "checkbox" })}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </Group>
                </form>
            </div>
        </Modal>
    );
}
