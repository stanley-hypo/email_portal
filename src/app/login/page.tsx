'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Box,
  Center,
  Image
} from '@mantine/core';
import { IconLock, IconLogin } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const success = await login(password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Container size="xs">
        <Paper
          radius="lg"
          p="xl"
          shadow="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Stack gap="lg" ta="center">
            {/* Logo/Icon */}
            <Center>
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <IconLock size={40} color="white" />
              </Box>
            </Center>

            {/* Title */}
            <Stack gap="xs" ta="center">
              <Title order={1} c="dark" fw={700}>
                API Portal
              </Title>
              <Text size="lg" c="dimmed">
                Hypothesis and Idea Business Solution Limited
              </Text>
              <Text size="sm" c="dimmed">
                Please enter your password to access the portal
              </Text>
            </Stack>

            {/* Error Alert */}
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  size="md"
                  leftSection={<IconLock size={18} />}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  size="md"
                  loading={isLoading}
                  leftSection={<IconLogin size={18} />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                  fullWidth
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            {/* Footer */}
            <Text size="xs" c="dimmed" ta="center" mt="lg">
              Secure access to email and PDF configuration management
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
