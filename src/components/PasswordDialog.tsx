'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Text,
  Group,
} from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

interface PasswordDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

export default function PasswordDialog({
  opened,
  onClose,
  onConfirm,
  error,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
    setPassword('');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Enter Admin Password"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">
            Please enter the password to access the SMTP configurations.
          </Text>
          
          <TextInput
            type="password"
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftSection={<IconLock size={16} />}
            error={error}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Access
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 