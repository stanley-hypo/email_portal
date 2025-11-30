"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserSchema, PasswordUpdateSchema } from "@/lib/validations/user";
import { isAdmin, requireAdmin } from "@/lib/auth-helpers";

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
        return { success: false, error: "Invalid fields" };
    }

    const { name, email, password, isAdmin } = validatedFields.data;

    // Check for duplicate email
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return { success: false, error: "Email already exists" };
    }

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            isAdmin,
        });

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to create user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(userId: string, formData: z.infer<typeof UserSchema>) {
    await requireAdmin();

    const validatedFields = UserSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" };
    }

    const { name, email, isAdmin } = validatedFields.data;

    // Check for duplicate email (excluding current user)
    const existingUser = await db.query.users.findFirst({
        where: (users, { and, eq, ne }) => and(eq(users.email, email), ne(users.id, userId)),
    });

    if (existingUser) {
        return { success: false, error: "Email already exists" };
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
                return { success: false, error: "Cannot remove the last admin" };
            }
        }
    }

    try {
        await db.update(users)
            .set({ name, email, isAdmin })
            .where(eq(users.id, userId));

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    const session = await auth();
    if (session?.user?.id === userId) {
        return { success: false, error: "Cannot delete your own account" };
    }

    try {
        await db.delete(users).where(eq(users.id, userId));

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

export async function updateSelfPassword(formData: z.infer<typeof PasswordUpdateSchema>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validatedFields = PasswordUpdateSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        // Get current user with password
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        if (!user || !user.password) {
            return { success: false, error: "User not found or password not set" };
        }

        // Verify current password
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        revalidatePath("/portal/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        return { success: false, error: "Failed to update password" };
    }
}

export async function adminResetPassword(userId: string, newPassword: string) {
    await requireAdmin();

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
    }

    try {
        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        revalidatePath("/portal/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to reset password:", error);
        return { success: false, error: "Failed to reset password" };
    }
}
