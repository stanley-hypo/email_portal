import { z } from "zod";

export const UserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    isAdmin: z.boolean().default(false),
});

export const PasswordUpdateSchema = z
    .object({
        currentPassword: z.string().min(6, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type UserFormData = z.infer<typeof UserSchema>;
export type PasswordUpdateFormData = z.infer<typeof PasswordUpdateSchema>;
