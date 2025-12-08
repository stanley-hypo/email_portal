'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { RecordType, EVENT_TYPES } from '@/types/usageLogs';

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
  const [now, setNow] = useState<number>(Date.now());
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

  const canQuery = useMemo(
    () => recordId.trim().length > 0 || recipient.trim().length > 0,
    [recordId, recipient]
  );
  const isStale =
    lastUpdated && Date.now() - new Date(lastUpdated).getTime() > 5 * 60 * 1000;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (recordId.trim()) params.set('recordId', recordId.trim());
      if (recordType) params.set('recordType', recordType);
      if (eventTypes.length) params.set('eventType', eventTypes.join(','));
      if (actor.trim()) params.set('actor', actor.trim());
      if (recipient.trim()) params.set('recipient', recipient.trim());
      if (status.trim()) params.set('status', status.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('page', `${page}`);
      params.set('pageSize', `${pageSize}`);
      params.set('sort', sort);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No auto-fetch without recordId; users must scope a record for audit
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const applyQuickSearch = () => {
    if (!quickSearch.trim()) return;
    if (quickSearch.includes('@')) {
      setRecipient(quickSearch.trim());
      setRecordId('');
    } else {
      setRecordId(quickSearch.trim());
    }
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (recordId.trim()) params.set('recordId', recordId.trim());
      if (recordType) params.set('recordType', recordType);
      if (eventTypes.length) params.set('eventType', eventTypes.join(','));
      if (actor.trim()) params.set('actor', actor.trim());
      if (recipient.trim()) params.set('recipient', recipient.trim());
      if (status.trim()) params.set('status', status.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(`/api/logs/export?${params.toString()}`);
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
              onClick={fetchLogs}
              disabled={!canQuery || loading}
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
              <Button onClick={fetchLogs} disabled={!canQuery || loading}>
                View Logs
              </Button>
              <Button
                variant="light"
                onClick={handleExport}
                disabled={!canQuery || exporting}
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
                onChange={(p) => setPage(p)}
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

