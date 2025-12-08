'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  MultiSelect,
  NumberInput,
  Pagination,
} from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RecordType } from '@/types/usageLogs';

interface UsageLog {
  id: string;
  recordId: string;
  recordType: RecordType;
  eventType: string;
  actorId?: string | null;
  actorEmail?: string | null;
  recipientEmail?: string | null;
  status?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  ingestedAt: string;
}

interface LogsResponse {
  items: UsageLog[];
  page: number;
  pageSize: number;
  total: number;
  retentionDays: number | null;
  lastUpdated: string;
  sort?: string;
}

type QueryOverrides = Partial<{
  recordId: string;
  recordType: RecordType | '';
  eventTypes: string[];
  actor: string;
  recipient: string;
  status: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  sort: string;
}>;

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function displayStatus(log: UsageLog) {
  if (log.status) return log.status;
  if (log.recordType === 'email') {
    return log.eventType.replace('email_', '');
  }
  if (log.recordType === 'pdf') {
    return log.eventType.replace('pdf_', '');
  }
  return log.eventType;
}

export default function LogsPage() {
  const [recordId, setRecordId] = useState('');
  const [recordType, setRecordType] = useState<RecordType | ''>('');
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [retentionDays, setRetentionDays] = useState<number | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [actor, setActor] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('createdAt:desc');
  const [exporting, setExporting] = useState(false);
  const isStale =
    lastUpdated && Date.now() - new Date(lastUpdated).getTime() > 5 * 60 * 1000;

  const buildParams = (overrides: QueryOverrides = {}) => {
    const params = new URLSearchParams();
    const recordIdValue = (overrides.recordId ?? recordId).trim();
    const recipientValue = (overrides.recipient ?? recipient).trim();
    const actorValue = (overrides.actor ?? actor).trim();
    const statusValue = (overrides.status ?? status).trim();
    const pageValue = overrides.page ?? page;
    const pageSizeValue = overrides.pageSize ?? pageSize;
    const sortValue = overrides.sort ?? sort;

    if (recordIdValue) params.set('recordId', recordIdValue);
    if (overrides.recordType ?? recordType)
      params.set('recordType', (overrides.recordType ?? recordType) as string);
    if ((overrides.eventTypes ?? eventTypes).length)
      params.set('eventType', (overrides.eventTypes ?? eventTypes).join(','));
    if (actorValue) params.set('actor', actorValue);
    if (recipientValue) params.set('recipient', recipientValue);
    if (statusValue) params.set('status', statusValue);
    if (overrides.from ?? from) params.set('from', overrides.from ?? from);
    if (overrides.to ?? to) params.set('to', overrides.to ?? to);
    params.set('page', `${pageValue}`);
    params.set('pageSize', `${pageSizeValue}`);
    params.set('sort', sortValue);
    return params;
  };

  const fetchLogs = async (overrides: QueryOverrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(overrides);
      const res = await fetch(`/api/logs?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load logs');
      }
      const data = (await res.json()) as LogsResponse;
      setLogs(data.items);
      setLastUpdated(data.lastUpdated);
      setRetentionDays(data.retentionDays);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setSort(data.sort || overrides.sort || sort);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyQuickSearch = () => {
    if (!quickSearch.trim()) return;
    const nextPage = 1;
    const value = quickSearch.trim();
    const nextRecipient = value.includes('@') ? value : '';
    const nextRecordId = value.includes('@') ? '' : value;
    setRecipient(nextRecipient);
    setRecordId(nextRecordId);
    setPage(nextPage);
    void fetchLogs({ page: nextPage, recipient: nextRecipient, recordId: nextRecordId });
  };

  const handleViewLogs = () => {
    const nextPage = 1;
    setPage(nextPage);
    void fetchLogs({ page: nextPage });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void fetchLogs({ page: nextPage });
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/logs/export?${buildParams().toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Failed to export logs');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'usage-logs-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Container size="lg" py="xl">
        <Group justify="space-between" align="center" mb="lg">
          <Title order={2}>Usage Logs</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                void fetchLogs();
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        <Card withBorder shadow="sm" mb="lg">
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Enter a record ID (PDF or email) and optional record type to view chronological usage events.
            </Text>
            <Group align="flex-end" wrap="wrap" gap="md">
              <TextInput
                label="Quick Search (record ID or recipient)"
                placeholder="Enter record id or recipient email"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.currentTarget.value)}
                style={{ minWidth: 280 }}
              />
              <Button variant="light" onClick={applyQuickSearch} disabled={!quickSearch.trim()}>
                Apply Quick Search
              </Button>
            </Group>

            <Group align="flex-end" wrap="wrap" gap="md" mt="sm">
              <TextInput
                label="Record ID"
                placeholder="e.g., PDF config ID or email job ID"
                value={recordId}
                onChange={(e) => setRecordId(e.currentTarget.value)}
                style={{ minWidth: 280 }}
              />
              <Select
                label="Record Type"
                placeholder="Any"
                value={recordType}
                onChange={(value) => setRecordType((value as RecordType | '') || '')}
                data={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'email', label: 'Email' },
                ]}
                allowDeselect
              />
              <MultiSelect
                label="Event Types"
                placeholder="Any"
                value={eventTypes}
                onChange={setEventTypes}
                data={[
                  { value: 'pdf_view', label: 'PDF View' },
                  { value: 'pdf_download', label: 'PDF Download' },
                  { value: 'pdf_print', label: 'PDF Print' },
                  { value: 'email_sent', label: 'Email Sent' },
                  { value: 'email_delivered', label: 'Email Delivered' },
                  { value: 'email_opened', label: 'Email Opened' },
                  { value: 'email_bounced', label: 'Email Bounced' },
                  { value: 'email_failed', label: 'Email Failed' },
                ]}
                searchable
                clearable
              />
              <TextInput
                label="Actor (email or ID)"
                placeholder="actor email or ID"
                value={actor}
                onChange={(e) => setActor(e.currentTarget.value)}
              />
              <TextInput
                label="Recipient"
                placeholder="recipient email"
                value={recipient}
                onChange={(e) => setRecipient(e.currentTarget.value)}
              />
              <TextInput
                label="Status"
                placeholder="e.g., delivered, bounced"
                value={status}
                onChange={(e) => setStatus(e.currentTarget.value)}
              />
              <TextInput
                label="From"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.currentTarget.value)}
              />
              <TextInput
                label="To"
                type="date"
                value={to}
                onChange={(e) => setTo(e.currentTarget.value)}
              />
              <Select
                label="Sort"
                value={sort}
                onChange={(v) => setSort(v || 'createdAt:desc')}
                data={[
                  { value: 'createdAt:desc', label: 'Newest first' },
                  { value: 'createdAt:asc', label: 'Oldest first' },
                  { value: 'eventType:asc', label: 'Event type (A→Z)' },
                  { value: 'eventType:desc', label: 'Event type (Z→A)' },
                ]}
              />
              <NumberInput
                label="Page size"
                value={pageSize}
                onChange={(v) => setPageSize(Number(v) || 20)}
                min={1}
                max={100}
              />
              <Button onClick={handleViewLogs} disabled={loading}>
                View Logs
              </Button>
              <Button
                variant="light"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Exporting…' : 'Export CSV'}
              </Button>
            </Group>
          </Stack>
        </Card>

        {retentionDays !== null && (
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={16} />}
            mb="md"
            title="Retention notice"
          >
            Log data is retained for {retentionDays} days. Older events may not appear.
          </Alert>
        )}

        {lastUpdated && (
          <Text size="sm" c="dimmed" mb="xs">
            Last updated: {formatDate(lastUpdated)} {isStale ? '(>5m old, refresh recommended)' : ''}
          </Text>
        )}

        {isStale && (
          <Alert color="yellow" icon={<IconAlertCircle size={16} />} mb="md">
            Data may be older than 5 minutes. Refresh to see latest events.
          </Alert>
        )}

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
            {error}
          </Alert>
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : logs.length === 0 ? (
          <Card withBorder>
            <Text c="dimmed">No activity recorded for the selected filters.</Text>
          </Card>
        ) : (
          <Card withBorder shadow="sm">
            <Group justify="space-between" mb="sm">
              <Text size="sm" c="dimmed">
                Total: {total} • Page {page} / {Math.max(1, Math.ceil(total / pageSize))}
              </Text>
              <Pagination
                total={Math.max(1, Math.ceil(total / pageSize))}
                value={page}
                onChange={(p) => handlePageChange(p)}
              />
            </Group>
            <Table highlightOnHover withTableBorder>
              <Table.Caption>Usage events for selected record and filters</Table.Caption>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Record</Table.Th>
                  <Table.Th>Actor</Table.Th>
                  <Table.Th>Recipient</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Source</Table.Th>
                  <Table.Th>Created At</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="light">{log.eventType}</Badge>
                        <Badge color="gray" variant="light">
                          {log.recordType}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>{log.recordId}</Table.Td>
                    <Table.Td>{log.actorEmail || log.actorId || '-'}</Table.Td>
                    <Table.Td>{log.recipientEmail || '-'}</Table.Td>
                    <Table.Td>{displayStatus(log)}</Table.Td>
                    <Table.Td>{log.source || '-'}</Table.Td>
                    <Table.Td>{formatDate(log.createdAt)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Container>
    </ProtectedRoute>
  );
}

