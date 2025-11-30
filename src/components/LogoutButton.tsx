"use client";

import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";

export function LogoutButton() {
    return (
        <Button
            variant="subtle"
            color="red"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            Sign Out
        </Button>
    );
}
