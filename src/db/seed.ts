import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
    // Create admin user
    const adminPassword = "abc12345";
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.insert(users).values({
        name: "Admin User",
        email: "admin@hypoidea.com",
        password: adminHashedPassword,
        isAdmin: true,
    }).onConflictDoNothing();

    console.log("Seed completed: Admin user created");
    console.log("Email: admin@hypoidea.com");
    console.log("Password: admin123");
    console.log("Role: Administrator");
    
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
