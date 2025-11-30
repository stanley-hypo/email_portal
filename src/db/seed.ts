import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await db.insert(users).values({
        name: "Test User",
        email: "user@example.com",
        password: hashedPassword,
    }).onConflictDoNothing();

    console.log("Seed completed: Test user created (email: user@example.com, password: password123)");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
