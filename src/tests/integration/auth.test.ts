import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Mock auth logic since we can't easily test NextAuth full flow in isolation without E2E
// This test verifies the underlying data and password verification logic used by authorize()

describe("Auth Integration", () => {
    const testEmail = "integration-test@example.com";
    const testPassword = "password123";

    beforeAll(async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await db.insert(users).values({
            email: testEmail,
            password: hashedPassword,
            name: "Integration Test User",
        }).onConflictDoNothing();
    });

    afterAll(async () => {
        await db.delete(users).where(eq(users.email, testEmail));
    });

    it("should verify correct password", async () => {
        const user = await db.query.users.findFirst({
            where: eq(users.email, testEmail),
        });
        expect(user).toBeDefined();
        if (!user || !user.password) throw new Error("User not found or has no password");

        const isValid = await bcrypt.compare(testPassword, user.password);
        expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
        const user = await db.query.users.findFirst({
            where: eq(users.email, testEmail),
        });
        expect(user).toBeDefined();
        if (!user || !user.password) throw new Error("User not found or has no password");

        const isValid = await bcrypt.compare("wrongpassword", user.password);
        expect(isValid).toBe(false);
    });
});
