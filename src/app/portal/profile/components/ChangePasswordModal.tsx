"use client";

import { Modal, PasswordInput, Button, Group, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { updateSelfPassword } from "@/app/actions/user";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { zodResolver } from "mantine-form-zod-resolver";
import { PasswordUpdateSchema } from "@/lib/validations/user";

interface ChangePasswordModalProps {
    opened: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validate: zodResolver(PasswordUpdateSchema),
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const result = await updateSelfPassword(values);
        setLoading(false);

        if (result.success) {
            notifications.show({
                title: "Success",
                message: "Password updated successfully",
                color: "green",
            });
            form.reset();
            onClose();
        } else {
            notifications.show({
                title: "Error",
                message: result.error || "Failed to update password",
                color: "red",
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Change Password">
            <div style={{ position: "relative" }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordInput
                        required
                        label="Current Password"
                        placeholder="Enter your current password"
                        mb="md"
                        {...form.getInputProps("currentPassword")}
                    />
                    <PasswordInput
                        required
                        label="New Password"
                        placeholder="Enter your new password"
                        mb="md"
                        {...form.getInputProps("newPassword")}
                    />
                    <PasswordInput
                        required
                        label="Confirm New Password"
                        placeholder="Confirm your new password"
                        mb="xl"
                        {...form.getInputProps("confirmPassword")}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Change Password</Button>
                    </Group>
                </form>
            </div>
        </Modal>
    );
}

