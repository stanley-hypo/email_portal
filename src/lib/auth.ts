import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [], // Providers will be added in later phases
});
