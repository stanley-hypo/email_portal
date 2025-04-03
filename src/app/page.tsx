'use client';

import PasswordDialog from '@/components/PasswordDialog';
import { SmtpConfig } from '@/types/smtp';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCopy, IconEdit, IconKey, IconLock, IconPlus, IconRefresh, IconTrash, IconX, IconCode, IconDownload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<SmtpConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<SmtpConfig | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [tokenModalConfig, setTokenModalConfig] = useState<SmtpConfig | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [newToken, setNewToken] = useState<{ token: string; name: string } | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [revokingToken, setRevokingToken] = useState<{ configId: string; token: string; name: string } | null>(null);
  const [revokeTokenInput, setRevokeTokenInput] = useState('');
  const [revokeError, setRevokeError] = useState<string | undefined>();
  const [postmanToken, setPostmanToken] = useState<{ token: string; config: SmtpConfig } | null>(null);
  const [isPostmanModalOpen, setIsPostmanModalOpen] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      secure: true,
      active: true,
      authTokens: [] as { token: string; name: string }[],
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      host: (value) => (!value ? 'Host is required' : null),
      port: (value) => (!value ? 'Port is required' : null),
      username: (value) => (!value ? 'Username is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
      fromEmail: (value) => (!value ? 'Email is required' : null),
      fromName: (value) => (!value ? 'From name is required' : null),
    },
  });

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/smtp-configs', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load configurations');
      }
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error loading configs:', error);
      setPasswordError('Failed to load configurations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadConfigs();
    }
  }, [isAuthenticated, authToken]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingConfig) {
        const response = await fetch(`/api/smtp-configs/${editingConfig.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error('Failed to update configuration');
      } else {
        const response = await fetch('/api/smtp-configs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error('Failed to add configuration');
      }
      await loadConfigs();
      resetForm();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleEdit = (config: SmtpConfig) => {
    setEditingConfig(config);
    form.setValues({
      name: config.name,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      secure: config.secure,
      active: config.active,
      authTokens: config.authTokens || [],
    });
    setIsFormModalOpen(true);
  };

  const resetForm = () => {
    setEditingConfig(null);
    form.reset();
    setIsFormModalOpen(false);
  };

  const handlePasswordConfirm = async (password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      setAuthToken(password);
      await loadConfigs();
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      setPasswordError(undefined);
    } catch (error) {
      console.error('Error during authentication:', error);
      setPasswordError('Invalid password. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;

    if (deleteEmail !== deletingConfig.fromEmail) {
      setDeleteError('Email does not match the configuration email');
      return;
    }

    try {
      const response = await fetch(`/api/smtp-configs/${deletingConfig.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      await loadConfigs();
      setIsDeleteModalOpen(false);
      setDeletingConfig(null);
      setDeleteEmail('');
      setDeleteError(undefined);
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setDeleteError('Failed to delete configuration. Please try again.');
    }
  };

  const handleUpdateTokens = async (configId: string, tokens: { token: string; name: string }[]) => {
    try {
      const response = await fetch(`/api/smtp-configs/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ authTokens: tokens }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tokens');
      }

      await loadConfigs();
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  };

  const generateToken = () => {
    const array = new Uint8Array(24); // 24 bytes will give us 32 characters in base64
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 32);
  };

  const generatePostmanCollection = (token: string, config: SmtpConfig) => {
    const collection = {
      info: {
        name: `SMTP Email API - ${config.name}`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Send Email",
          request: {
            method: "POST",
            header: [
              {
                key: "Authorization",
                value: `Bearer ${token}`,
                type: "text"
              },
              {
                key: "Content-Type",
                value: "application/json",
                type: "text"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                to: "recipient@example.com",
                subject: "Test Email",
                body: "This is a test email",
                fromEmail: config.fromEmail
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/send-email",
              host: ["{{baseUrl}}"],
              path: ["api", "send-email"]
            }
          }
        }
      ],
      variable: [
        {
          key: "baseUrl",
          value: process.env.NEXT_PUBLIC_APP_URL,
          type: "string"
        }
      ]
    };
    return collection;
  };

  const handleDownloadPostmanCollection = () => {
    if (!postmanToken) return;
    
    const collection = generatePostmanCollection(postmanToken.token, postmanToken.config);
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SMTP_Email_API_${postmanToken.config.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRevokeToken = () => {
    if (revokeTokenInput === revokingToken?.token) {
      const config = configs.find(c => c.id === revokingToken.configId);
      if (config) {
        const updatedTokens = config.authTokens.filter(t => t.token !== revokingToken.token);
        handleUpdateTokens(revokingToken.configId, updatedTokens);
        setRevokingToken(null);
        setRevokeTokenInput('');
      }
    } else {
      setRevokeError('Token does not match');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container size="sm" py="xl">
        <Alert
          icon={<IconLock size={16} />}
          title="Authentication Required"
          color="blue"
          variant="light"
        >
          <Text size="sm" mt="xs">
            Please enter the password to manage SMTP configurations.
          </Text>
        </Alert>

        <PasswordDialog
          opened={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          onConfirm={handlePasswordConfirm}
          error={passwordError}
        />
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center">
        SMTP Configuration Manager
      </Title>
      
      <Group justify="flex-end" mb="xl">
        <Button
          onClick={() => {
            resetForm();
            setIsFormModalOpen(true);
          }}
        >
          <IconPlus size={16} style={{ marginRight: 8 }} />
          Add New Configuration
        </Button>
      </Group>

      <Modal
        opened={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingConfig ? "Edit Configuration" : "Add New Configuration"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter configuration name"
              required
              {...form.getInputProps('name')}
            />
            
            <TextInput
              label="Host"
              placeholder="smtp.example.com"
              required
              {...form.getInputProps('host')}
            />

            <NumberInput
              label="Port"
              placeholder="587"
              required
              min={1}
              max={65535}
              {...form.getInputProps('port')}
            />

            <TextInput
              label="Username"
              placeholder="Enter username"
              required
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              required
              {...form.getInputProps('password')}
            />

            <TextInput
              label="From Email"
              placeholder="sender@example.com"
              required
              {...form.getInputProps('fromEmail')}
            />

            <TextInput
              label="From Name"
              placeholder="Sender Name"
              required
              {...form.getInputProps('fromName')}
            />

            <Group>
              <Checkbox
                label="Secure (SSL/TLS)"
                {...form.getInputProps('secure', { type: 'checkbox' })}
              />
              <Checkbox
                label="Active"
                {...form.getInputProps('active', { type: 'checkbox' })}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="gray"
                onClick={() => setIsFormModalOpen(false)}
              >
                <IconX size={16} style={{ marginRight: 8 }} />
                Cancel
              </Button>
              <Button
                type="submit"
              >
                {editingConfig ? (
                  <>
                    <IconEdit size={16} style={{ marginRight: 8 }} />
                    Update
                  </>
                ) : (
                  <>
                    <IconPlus size={16} style={{ marginRight: 8 }} />
                    Add Configuration
                  </>
                )}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Title order={2} mb="md">
        Existing Configurations
      </Title>

      {isLoading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      ) : configs.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            No SMTP configurations found. Click Add New Configuration to create one.
          </Text>
        </Paper>
      ) : (
        <Grid>
          {configs.map((config) => (
            <Grid.Col key={config.id} span={{ base: 12, sm: 6, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Title order={3}>{config.name}</Title>
                  <Group>
                    <Tooltip label="Manage Auth Tokens">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => {
                          setTokenModalConfig(config);
                          setIsTokenModalOpen(true);
                        }}
                      >
                        <IconKey size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit Configuration">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => handleEdit(config)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Configuration">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => {
                          setDeletingConfig(config);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Host: {config.host}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Port: {config.port}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Username: {config.username}
                  </Text>
                  <Text size="sm" c="dimmed">
                    From: {config.fromName} &lt;{config.fromEmail}&gt;
                  </Text>
                  <Group gap="xs">
                    <Badge color={config.secure ? 'green' : 'red'}>
                      {config.secure ? 'Secure' : 'Insecure'}
                    </Badge>
                    <Badge color={config.active ? 'blue' : 'gray'}>
                      {config.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Group>
                  {config.authTokens && config.authTokens.length > 0 && (
                    <Stack gap="xs" mt="xs">
                      <Text size="sm" fw={500}>Auth Tokens ({config.authTokens.length}):</Text>
                      <Stack gap="xs">
                        {config.authTokens.map((tokenData, index) => (
                          <Paper key={index} p="xs" radius="md" withBorder>
                            <Stack gap="xs">
                              {tokenData.name && (
                                <Text size="sm" fw={500}>{tokenData.name}</Text>
                              )}
                              <Group justify="space-between">
                                <Text size="sm" style={{ fontFamily: 'monospace' }}>
                                  {tokenData.token}
                                </Text>
                                <Group>
                                  <Tooltip label="Show Postman Example">
                                    <ActionIcon
                                      color="blue"
                                      variant="light"
                                      onClick={() => {
                                        setPostmanToken({ token: tokenData.token, config });
                                        setIsPostmanModalOpen(true);
                                      }}
                                    >
                                      <IconCode size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Button
                                    variant="light"
                                    color="red"
                                    size="xs"
                                    onClick={() => {
                                      setRevokingToken({ configId: config.id, token: tokenData.token, name: tokenData.name });
                                      setRevokeTokenInput('');
                                      setRevokeError(undefined);
                                    }}
                                  >
                                    Revoke
                                  </Button>
                                </Group>
                              </Group>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingConfig(null);
          setDeleteEmail('');
          setDeleteError(undefined);
        }}
        title="Delete Configuration"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            To delete this configuration, please enter the email address associated with it:
          </Text>
          <Text size="sm" fw={500}>
            {deletingConfig?.fromEmail}
          </Text>
          <TextInput
            label="Confirm Email"
            placeholder="Enter email to confirm deletion"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            error={deleteError}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingConfig(null);
                setDeleteEmail('');
                setDeleteError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              disabled={deleteEmail !== deletingConfig?.fromEmail}
            >
              Delete Configuration
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isTokenModalOpen}
        onClose={() => {
          setIsTokenModalOpen(false);
          setTokenModalConfig(null);
          setNewToken(null);
          setTokenName('');
        }}
        title="Manage Auth Tokens"
        size="md"
      >
        {tokenModalConfig && (
          <Stack gap="md">
            <Text size="sm">
              Generate and manage auth tokens for {tokenModalConfig.name}
            </Text>
            
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                const token = generateToken();
                setNewToken({ token, name: '' });
                setTokenName('');
              }}
            >
              Generate New Token
            </Button>

            {newToken && (
              <Paper p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>New Token Generated:</Text>
                  <TextInput
                    label="Token Name"
                    placeholder="Enter a name for this token (e.g., Production API)"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                  <Group gap="xs">
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>{newToken.token}</Text>
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => {
                        navigator.clipboard.writeText(newToken.token);
                      }}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Make sure to copy this token now. You won&apos;t be able to see it again!
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => {
                      if (tokenName.trim()) {
                        const updatedTokens = [...(tokenModalConfig?.authTokens || []), { token: newToken.token, name: tokenName }];
                        handleUpdateTokens(tokenModalConfig!.id, updatedTokens);
                        setNewToken(null);
                        setTokenName('');
                      }
                    }}
                    disabled={!tokenName.trim()}
                  >
                    Save Token
                  </Button>
                </Stack>
              </Paper>
            )}

            {tokenModalConfig?.authTokens && tokenModalConfig.authTokens.length > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>Existing Tokens:</Text>
                <Stack gap="xs">
                  {tokenModalConfig.authTokens.map((tokenData, index) => (
                    <Paper key={index} p="xs" radius="md" withBorder>
                      <Stack gap="xs">
                        {tokenData.name && (
                          <Text size="sm" fw={500}>{tokenData.name}</Text>
                        )}
                        <Group justify="space-between">
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>
                            {tokenData.token}
                          </Text>
                          <Group>
                            <Tooltip label="Show Postman Example">
                              <ActionIcon
                                color="blue"
                                variant="light"
                                onClick={() => {
                                  setPostmanToken({ token: tokenData.token, config: tokenModalConfig });
                                  setIsPostmanModalOpen(true);
                                }}
                              >
                                <IconCode size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Button
                              variant="light"
                              color="red"
                              size="xs"
                              onClick={() => {
                                const updatedTokens = tokenModalConfig.authTokens.filter((_, i) => i !== index);
                                handleUpdateTokens(tokenModalConfig.id, updatedTokens);
                              }}
                            >
                              Revoke
                            </Button>
                          </Group>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </Modal>

      <Modal
        opened={!!revokingToken}
        onClose={() => {
          setRevokingToken(null);
          setRevokeTokenInput('');
          setRevokeError(undefined);
        }}
        title="Revoke Token"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            To revoke this token, please type it exactly as shown:
          </Text>
          <Text size="sm" style={{ fontFamily: 'monospace' }}>
            {revokingToken?.token}
          </Text>
          <TextInput
            label="Confirm Token"
            placeholder="Type the token to confirm"
            value={revokeTokenInput}
            onChange={(e) => setRevokeTokenInput(e.target.value)}
            error={revokeError}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setRevokingToken(null);
                setRevokeTokenInput('');
                setRevokeError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleRevokeToken}
              disabled={revokeTokenInput !== revokingToken?.token}
            >
              Revoke Token
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isPostmanModalOpen}
        onClose={() => {
          setIsPostmanModalOpen(false);
          setPostmanToken(null);
        }}
        title="Postman Example"
        size="lg"
      >
        {postmanToken && (
          <Stack gap="md">
            <Text size="sm">
              Here is how to use this token in Postman:
            </Text>
            
            <Paper p="md" radius="md" withBorder>
              <Stack gap="xs">
                <Text size="sm" fw={500}>Request Details:</Text>
                <Text size="sm" style={{ fontFamily: 'monospace' }}>
                  POST /api/send-email
                </Text>
                <Text size="sm" fw={500}>Headers:</Text>
                <Text size="sm" style={{ fontFamily: 'monospace' }}>
                  Authorization: Bearer {postmanToken.token}
                </Text>
                <Text size="sm" fw={500}>Body (JSON):</Text>
                <Text size="sm" style={{ fontFamily: 'monospace' }}>
                  {JSON.stringify({
                    to: "recipient@example.com",
                    subject: "Test Email",
                    body: "This is a test email",
                    fromEmail: postmanToken.config.fromEmail
                  }, null, 2)}
                </Text>
              </Stack>
            </Paper>

            <Text size="sm" c="dimmed">
              Make sure to replace the recipient email address and content with your desired values.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="blue"
                onClick={handleDownloadPostmanCollection}
                leftSection={<IconDownload size={16} />}
              >
                Download Postman Collection
              </Button>
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  setIsPostmanModalOpen(false);
                  setPostmanToken(null);
                }}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
