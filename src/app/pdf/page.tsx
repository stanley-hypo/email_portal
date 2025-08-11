'use client';

import { PdfConfig } from '@/types/smtp';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  TagsInput,
  Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCopy, IconEdit, IconKey, IconPlus, IconRefresh, IconTrash, IconX, IconFileTypePdf, IconCode, IconDownload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PdfPage() {
  const { authToken } = useAuth();
  const [configs, setConfigs] = useState<PdfConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<PdfConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<PdfConfig | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [tokenModalConfig, setTokenModalConfig] = useState<PdfConfig | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [newToken, setNewToken] = useState<{ token: string; name: string } | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testHtml, setTestHtml] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test PDF Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .content { line-height: 1.6; }
        .highlight { background-color: #f0f8ff; padding: 20px; border-left: 4px solid #007acc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test PDF Document</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="content">
        <h2>Sample Content</h2>
        <p>This is a test document to verify PDF generation functionality.</p>
        <div class="highlight">
            <p><strong>Note:</strong> This PDF was generated using the HTML to PDF API.</p>
        </div>
        <h3>Features Tested:</h3>
        <ul>
            <li>HTML to PDF conversion</li>
            <li>CSS styling</li>
            <li>Text formatting</li>
            <li>Colors and backgrounds</li>
        </ul>
    </div>
</body>
</html>`);
  const [testingConfig, setTestingConfig] = useState<PdfConfig | null>(null);
  const [postmanToken, setPostmanToken] = useState<{ token: string; config: PdfConfig } | null>(null);
  const [isPostmanModalOpen, setIsPostmanModalOpen] = useState(false);
  const [showFormInputs, setShowFormInputs] = useState(false);
  const [postmanHtml, setPostmanHtml] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Postman Test Document</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background-color: #f9f9f9; 
        }
        .header { 
            text-align: center; 
            color: #333; 
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }
        .content { 
            line-height: 1.6; 
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .highlight { 
            background-color: #e3f2fd; 
            padding: 20px; 
            border-left: 4px solid #2196f3;
            margin: 20px 0;
            border-radius: 5px;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .feature-item {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #4caf50;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PDF Generation API Test</h1>
        <p>Generated via Postman on {{DATE}}</p>
    </div>
    <div class="content">
        <h2>API Testing Document</h2>
        <p>This document demonstrates the PDF generation capabilities of our API.</p>
        
        <div class="highlight">
            <p><strong>API Endpoint:</strong> POST /api/html-to-pdf</p>
            <p><strong>Authentication:</strong> Bearer Token Required</p>
        </div>
        
        <h3>Supported Features:</h3>
        <div class="feature-list">
            <div class="feature-item">
                <strong>HTML to PDF Conversion</strong><br>
                Convert any HTML content to PDF format
            </div>
            <div class="feature-item">
                <strong>Custom Styling</strong><br>
                Full CSS support including gradients and shadows
            </div>
            <div class="feature-item">
                <strong>Flexible Options</strong><br>
                Configurable page format and margins
            </div>
            <div class="feature-item">
                <strong>Secure Access</strong><br>
                Token-based authentication and IP whitelisting
            </div>
        </div>
        
        <h3>Request Parameters:</h3>
        <ul>
            <li><code>html</code> - HTML content to convert (required)</li>
            <li><code>filename</code> - Output filename (optional)</li>
            <li><code>options</code> - PDF generation options (optional)</li>
        </ul>
    </div>
</body>
</html>`);

  const form = useForm({
    initialValues: {
      name: '',
      ipWhitelist: [] as string[],
      active: true,
      authTokens: [] as { token: string; name: string }[],
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      ipWhitelist: (value) => {
        // IP whitelist is optional, but if provided, validate format
        for (const ip of value) {
          if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
            return `Invalid IP address: ${ip}`;
          }
        }
        return null;
      },
    },
  });

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pdf-configs', {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadConfigs();
    }
  }, [authToken]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingConfig) {
        const response = await fetch(`/api/pdf-configs/${editingConfig.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to update configuration');
        }
      } else {
        const response = await fetch('/api/pdf-configs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to add configuration');
        }
      }
      await loadConfigs();
      resetForm();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (config: PdfConfig) => {
    setEditingConfig(config);
    form.setValues({
      name: config.name,
      ipWhitelist: config.ipWhitelist,
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



  const handleDelete = async () => {
    if (!deletingConfig) return;

    if (deleteName !== deletingConfig.name) {
      setDeleteError('Name does not match the configuration name');
      return;
    }

    try {
      const response = await fetch(`/api/pdf-configs/${deletingConfig.id}`, {
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
      setDeleteName('');
      setDeleteError(undefined);
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setDeleteError('Failed to delete configuration. Please try again.');
    }
  };

  const handleUpdateTokens = async (configId: string, tokens: { token: string; name: string }[]) => {
    try {
      const response = await fetch(`/api/pdf-configs/${configId}`, {
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

  const generatePostmanCollection = (token: string, config: PdfConfig) => {
    const collection = {
      info: {
        name: `PDF Generation API - ${config.name}`,
        description: "API collection for HTML to PDF conversion service",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Generate PDF from HTML",
          request: {
            method: "POST",
            header: [
              {
                key: "Authorization",
                value: `Bearer ${token}`,
                type: "text",
                description: "PDF API authentication token"
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
                html: postmanHtml.replace('{{DATE}}', new Date().toLocaleString()),
                filename: "test_document.pdf",
                options: {
                  format: "A4",
                  printBackground: true,
                  margin: {
                    top: "1cm",
                    right: "1cm",
                    bottom: "1cm",
                    left: "1cm"
                  }
                }
              }, null, 2),
              options: {
                raw: {
                  language: "json"
                }
              }
            },
            url: {
              raw: "{{baseUrl}}/api/html-to-pdf",
              host: ["{{baseUrl}}"],
              path: ["api", "html-to-pdf"]
            },
            description: "Convert HTML content to PDF format. Returns PDF file as binary response."
          },
          response: []
        },
        {
          name: "Generate PDF - Simple Example",
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
                html: "<html><body><h1>Simple PDF Test</h1><p>This is a simple test document.</p></body></html>",
                filename: "simple_test.pdf"
              }, null, 2),
              options: {
                raw: {
                  language: "json"
                }
              }
            },
            url: {
              raw: "{{baseUrl}}/api/html-to-pdf",
              host: ["{{baseUrl}}"],
              path: ["api", "html-to-pdf"]
            },
            description: "Simple HTML to PDF conversion example"
          },
          response: []
        }
      ],
      variable: [
        {
          key: "baseUrl",
          value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          type: "string",
          description: "Base URL for the PDF API"
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
    a.download = `PDF_API_${postmanToken.config.name.replace(/\s+/g, '_')}.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestPdf = async () => {
    if (!testingConfig || !testingConfig.authTokens.length) {
      alert('Please select a token to test with');
      return;
    }

    try {
      const token = testingConfig.authTokens[0].token; // Use first available token
      
      const response = await fetch('/api/html-to-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          html: testHtml,
          filename: `test_${testingConfig.name}_${Date.now()}.pdf`,
          options: {
            format: 'A4',
            printBackground: true,
            margin: {
              top: '1cm',
              right: '1cm',
              bottom: '1cm',
              left: '1cm'
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_${testingConfig.name}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsTestModalOpen(false);
      alert('PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <ProtectedRoute>
      <Container size="lg" py="xl">
        <Title order={1} mb="xl" ta="center">
          PDF Configuration Manager
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
            
            <TagsInput
              label="IP Whitelist (Optional)"
              placeholder="Enter IP addresses (e.g., 192.168.1.100)"
              description="Press Enter to add each IP address. Leave empty to allow all IPs."
              {...form.getInputProps('ipWhitelist')}
            />

            <Checkbox
              label="Active"
              {...form.getInputProps('active', { type: 'checkbox' })}
            />

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
            No PDF configurations found. Click Add New Configuration to create one.
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
                    <Tooltip label="Test PDF Generation">
                      <ActionIcon
                        color="green"
                        variant="light"
                        onClick={() => {
                          setTestingConfig(config);
                          setIsTestModalOpen(true);
                        }}
                        disabled={!config.authTokens || config.authTokens.length === 0}
                      >
                        <IconFileTypePdf size={16} />
                      </ActionIcon>
                    </Tooltip>
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
                    IP Whitelist: {config.ipWhitelist.length > 0 ? config.ipWhitelist.join(', ') : 'All IPs allowed'}
                  </Text>
                  <Group gap="xs">
                    <Badge color={config.active ? 'blue' : 'gray'}>
                      {config.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {config.ipWhitelist.length === 0 && (
                      <Badge color="orange" variant="light">
                        No IP restrictions
                      </Badge>
                    )}
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
                                      const updatedTokens = config.authTokens.filter((_, i) => i !== index);
                                      handleUpdateTokens(config.id, updatedTokens);
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
          setDeleteName('');
          setDeleteError(undefined);
        }}
        title="Delete Configuration"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            To delete this configuration, please enter the configuration name:
          </Text>
          <Text size="sm" fw={500}>
            {deletingConfig?.name}
          </Text>
          <TextInput
            label="Confirm Name"
            placeholder="Enter name to confirm deletion"
            value={deleteName}
            onChange={(e) => setDeleteName(e.target.value)}
            error={deleteError}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingConfig(null);
                setDeleteName('');
                setDeleteError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              disabled={deleteName !== deletingConfig?.name}
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
        opened={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setTestingConfig(null);
        }}
        title="Test PDF Generation"
        size="xl"
      >
        {testingConfig && (
          <Stack gap="md">
            <Text size="sm">
              Test PDF generation for <strong>{testingConfig.name}</strong>
            </Text>
            
            {testingConfig.authTokens && testingConfig.authTokens.length > 0 ? (
              <>
                <Text size="xs" c="dimmed">
                  Using token: {testingConfig.authTokens[0].name || 'Unnamed'} ({testingConfig.authTokens[0].token.substring(0, 8)}...)
                </Text>
                
                <Textarea
                  label="HTML Content"
                  placeholder="Enter HTML content to convert to PDF"
                  value={testHtml}
                  onChange={(e) => setTestHtml(e.target.value)}
                  minRows={15}
                  autosize
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => {
                      setIsTestModalOpen(false);
                      setTestingConfig(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="green"
                    onClick={handleTestPdf}
                    leftSection={<IconFileTypePdf size={16} />}
                  >
                    Generate PDF
                  </Button>
                </Group>
              </>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No auth tokens available for this configuration. Please add a token first.
              </Text>
            )}
          </Stack>
        )}
      </Modal>

      <Modal
        opened={isPostmanModalOpen}
        onClose={() => {
          setIsPostmanModalOpen(false);
          setPostmanToken(null);
        }}
        title="Postman Example"
        size="xl"
      >
        {postmanToken && (
          <Stack gap="md">
            <Text size="sm">
              Here is how to use this token in Postman for PDF generation:
            </Text>

            <Button
              variant="light"
              onClick={() => setShowFormInputs(!showFormInputs)}
              leftSection={<IconEdit size={16} />}
            >
              {showFormInputs ? 'Hide Form Inputs' : 'Show Form Inputs'}
            </Button>

            {showFormInputs && (
              <Textarea
                label="HTML Content"
                placeholder="Enter HTML content to convert to PDF"
                value={postmanHtml}
                onChange={(e) => setPostmanHtml(e.target.value)}
                minRows={15}
                autosize
              />
            )}

            <Paper p="md" radius="md" withBorder>
              <Text size="sm" fw={500}>Request Details:</Text>
              <Text size="sm" style={{ fontFamily: 'monospace' }}>
                POST /api/html-to-pdf
              </Text>
              <Text size="sm" fw={500} mt="md">Headers:</Text>
              <Text size="sm" style={{ fontFamily: 'monospace' }}>
                Authorization: Bearer {postmanToken.token}
              </Text>
              <Text size="sm" style={{ fontFamily: 'monospace' }}>
                Content-Type: application/json
              </Text>
              <Text size="sm" fw={500} mt="md">Body (JSON):</Text>
              <Text size="sm" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({
                  html: postmanHtml.replace('{{DATE}}', new Date().toLocaleString()),
                  filename: "test_document.pdf",
                  options: {
                    format: "A4",
                    printBackground: true,
                    margin: {
                      top: "1cm",
                      right: "1cm",
                      bottom: "1cm",
                      left: "1cm"
                    }
                  }
                }, null, 2)}
              </Text>
            </Paper>

            <Paper p="md" radius="md" withBorder>
              <Text size="sm" fw={500}>Available Options:</Text>
              <Stack gap="xs" mt="xs">
                <Text size="sm">• <strong>html</strong> (required): HTML content to convert</Text>
                <Text size="sm">• <strong>filename</strong> (optional): Output PDF filename</Text>
                <Text size="sm">• <strong>options.format</strong>: Page format (A4, A3, Letter, etc.)</Text>
                <Text size="sm">• <strong>options.printBackground</strong>: Include background colors/images</Text>
                <Text size="sm">• <strong>options.margin</strong>: Page margins (top, right, bottom, left)</Text>
              </Stack>
            </Paper>

            <Text size="sm" c="dimmed">
              The API returns a PDF file as binary response. In Postman, you can save the response to file.
            </Text>
          </Stack>
        )}
        <Group justify="flex-end" mt="md" style={{ position: 'sticky', bottom: 0, background: 'white', padding: '16px', borderTop: '1px solid #eee' }}>
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
      </Modal>
    </Container>
    </ProtectedRoute>
  );
}
