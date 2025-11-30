"use client";

import { Modal, TextInput, PasswordInput, Checkbox, Button, Group, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createUser } from "@/app/actions/user";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { zodResolver } from "mantine-form-zod-resolver";
import { UserSchema } from "@/lib/validations/user";

interface CreateUserModalProps {
    opened: boolean;
    onClose: () => void;
}

export function CreateUserModal({ opened, onClose }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            name: "",
            email: "",
            password: "",
            isAdmin: false,
        },
        validate: zodResolver(UserSchema),
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const result = await createUser(values);
        setLoading(false);

        if (result.success) {
            notifications.show({
                title: "Success",
                message: "User created successfully",
                color: "green",
            });
            form.reset();
            onClose();
        } else {
            notifications.show({
                title: "Error",
                message: result.error || "Failed to create user",
                color: "red",
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create New User">
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
                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        mb="md"
                        {...form.getInputProps("password")}
                    />
                    <Checkbox
                        label="Admin Privileges"
                        mb="xl"
                        {...form.getInputProps("isAdmin", { type: "checkbox" })}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create User</Button>
                    </Group>
                </form>
            </div>
        </Modal>
    );
}
