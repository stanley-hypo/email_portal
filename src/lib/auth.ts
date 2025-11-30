import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    providers: [], // Providers will be added in later phases
});
