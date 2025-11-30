import { Button } from "@mantine/core";
import { logout } from "@/lib/actions";

export function LogoutButton() {
    return (
        <form action={logout}>
            <Button
                type="submit"
                variant="subtle"
                color="red"
            >
                Sign Out
            </Button>
        </form>
    );
}
