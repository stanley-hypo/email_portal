import { auth } from "@/lib/auth";

export async function isAdmin() {
    const session = await auth();
    return session?.user?.isAdmin === true;
}

export async function requireAdmin() {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
        throw new Error("Unauthorized: Admin access required");
    }
}
