"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserSchema, PasswordUpdateSchema } from "@/lib/validations/user";
import { requireAdmin } from "@/lib/auth-helpers";
import { userActivityLogger } from "@/utils/userActivityLogger";

// Actions will be implemented here

export async function getUsers() {
    await requireAdmin();

    try {
        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            emailVerified: users.emailVerified,
            isAdmin: users.isAdmin,
        }).from(users).orderBy(users.name);

        return { success: true, data: allUsers };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function createUser(formData: z.infer<typeof UserSchema>) {
    await requireAdmin();

    const validatedFields = UserSchema.safeParse(formData);

    if (!validatedFields.success) {
        const errors = validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errors}` };
    }

    const { name, email, password, isAdmin } = validatedFields.data;

    // Check for duplicate email
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return { success: false, error: `Email "${email}" is already registered. Please use a different email address.` };
    }

    try {
        const session = await auth();
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const newUser = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            isAdmin,
        }).returning();

        // Log user creation activity
        userActivityLogger.log({
            action: 'USER_CREATED',
            actorId: session?.user?.id,
            actorEmail: session?.user?.email || undefined,
            targetUserId: newUser[0]?.id,
            targetUserEmail: email,
            details: {
                name,
                isAdmin,
            },
        });

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to create user:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: `Failed to create user: ${errorMessage}` };
    }
}

export async function updateUser(userId: string, formData: z.infer<typeof UserSchema>) {
    await requireAdmin();

    const validatedFields = UserSchema.safeParse(formData);

    if (!validatedFields.success) {
        const errors = validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errors}` };
    }

    const { name, email, isAdmin } = validatedFields.data;

    // Check for duplicate email (excluding current user)
    const existingUser = await db.query.users.findFirst({
        where: (users, { and, eq, ne }) => and(eq(users.email, email), ne(users.id, userId)),
    });

    if (existingUser) {
        return { success: false, error: `Email "${email}" is already registered to another user. Please use a different email address.` };
    }

    // Last admin protection
    if (!isAdmin) {
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (currentUser?.isAdmin) {
            const adminCount = await db
                .select({ count: users.id })
                .from(users)
                .where(eq(users.isAdmin, true));

            if (adminCount.length === 1) {
                return { success: false, error: "Cannot remove admin privileges from the last administrator. The system must have at least one admin user." };
            }
        }
    }

    try {
        const session = await auth();
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        await db.update(users)
            .set({ name, email, isAdmin })
            .where(eq(users.id, userId));

        // Log user update activity
        userActivityLogger.log({
            action: 'USER_UPDATED',
            actorId: session?.user?.id,
            actorEmail: session?.user?.email || undefined,
            targetUserId: userId,
            targetUserEmail: targetUser?.email,
            details: {
                name,
                email,
                isAdmin,
                previousIsAdmin: targetUser?.isAdmin,
            },
        });

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: `Failed to update user: ${errorMessage}` };
    }
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    const session = await auth();
    if (session?.user?.id === userId) {
        return { success: false, error: "You cannot delete your own account. Please ask another administrator to perform this action." };
    }

    try {
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        await db.delete(users).where(eq(users.id, userId));

        // Log user deletion activity
        if (targetUser) {
            userActivityLogger.log({
                action: 'USER_DELETED',
                actorId: session?.user?.id,
                actorEmail: session?.user?.email || undefined,
                targetUserId: userId,
                targetUserEmail: targetUser.email,
            });
        }

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: `Failed to delete user: ${errorMessage}` };
    }
}

export async function updateSelfPassword(formData: z.infer<typeof PasswordUpdateSchema>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to change your password." };
    }

    const validatedFields = PasswordUpdateSchema.safeParse(formData);
    if (!validatedFields.success) {
        const errors = validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errors}` };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        // Get current user with password
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        if (!user || !user.password) {
            return { success: false, error: "User account not found or password is not set. Please contact an administrator." };
        }

        // Verify current password
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, error: "The current password you entered is incorrect. Please try again." };
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        // Log password change activity
        userActivityLogger.log({
            action: 'PASSWORD_CHANGED',
            actorId: session.user.id,
            actorEmail: session.user.email || undefined,
            targetUserId: session.user.id,
            targetUserEmail: session.user.email || undefined,
        });

        revalidatePath("/portal/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: `Failed to update password: ${errorMessage}` };
    }
}

export async function adminResetPassword(userId: string, newPassword: string) {
    await requireAdmin();

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
    }

    try {
        const session = await auth();
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        // Log password reset activity
        userActivityLogger.log({
            action: 'PASSWORD_RESET',
            actorId: session?.user?.id,
            actorEmail: session?.user?.email || undefined,
            targetUserId: userId,
            targetUserEmail: targetUser?.email,
        });

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to reset password:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: `Failed to reset password: ${errorMessage}` };
    }
}
