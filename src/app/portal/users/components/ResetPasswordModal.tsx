"use client";

import { Modal, PasswordInput, Button, Group, LoadingOverlay, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { adminResetPassword } from "@/app/actions/user";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface ResetPasswordModalProps {
    user: User;
    opened: boolean;
    onClose: () => void;
}

const ResetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function ResetPasswordModal({ user, opened, onClose }: ResetPasswordModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validate: zodResolver(ResetPasswordSchema),
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const result = await adminResetPassword(user.id, values.newPassword);
        setLoading(false);

        if (result.success) {
            notifications.show({
                title: "Success",
                message: `Password reset successfully for ${user.name || user.email}`,
                color: "green",
            });
            form.reset();
            onClose();
        } else {
            notifications.show({
                title: "Error",
                message: result.error || "Failed to reset password",
                color: "red",
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Reset Password">
            <div style={{ position: "relative" }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <Text size="sm" c="dimmed" mb="md">
                    Reset password for <b>{user.name || user.email}</b>
                </Text>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordInput
                        required
                        label="New Password"
                        placeholder="Enter new password"
                        mb="md"
                        {...form.getInputProps("newPassword")}
                    />
                    <PasswordInput
                        required
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        mb="xl"
                        {...form.getInputProps("confirmPassword")}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Reset Password</Button>
                    </Group>
                </form>
            </div>
        </Modal>
    );
}

