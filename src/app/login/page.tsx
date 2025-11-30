"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import { Button, TextInput, PasswordInput, Container, Title, Paper, Text } from "@mantine/core";

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>


      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form action={dispatch}>
          <TextInput label="Email" placeholder="you@mantine.dev" name="email" required />
          <PasswordInput label="Password" placeholder="Your password" name="password" required mt="md" />
          <Button fullWidth mt="xl" type="submit" loading={isPending}>
            Sign in
          </Button>
          {errorMessage && (
            <Text c="red" size="sm" mt="sm">
              {errorMessage}
            </Text>
          )}
        </form>
      </Paper>
    </Container>
  );
}
