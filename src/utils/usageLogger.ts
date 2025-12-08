import { db } from "../db";
import { usageLogs } from "../db/schema";
import {
    LogUsageEventInput,
    NormalizedLogUsageEvent,
    normalizeLogEvent,
    computeFreshnessMs,
} from "../types/usageLogs";

type InsertableUsageLog = typeof usageLogs.$inferInsert;
type UsageLog = typeof usageLogs.$inferSelect;

export interface LogUsageResult {
    log: UsageLog;
    ingestionMs: number;
}

export async function logUsageEvent(
    input: LogUsageEventInput
): Promise<LogUsageResult> {
    const normalized: NormalizedLogUsageEvent = normalizeLogEvent(input);
    const ingestedAt = new Date();

    const values: InsertableUsageLog = {
        recordId: normalized.recordId,
        recordType: normalized.recordType,
        eventType: normalized.eventType,
        actorId: normalized.actorId,
        actorEmail: normalized.actorEmail,
        recipientEmail: normalized.recipientEmail,
        status: normalized.status,
        source: normalized.source,
        metadata: {
            ...normalized.metadata,
            ingestedAt: ingestedAt.toISOString(),
        },
        createdAt: normalized.createdAt,
        ingestedAt,
    };

    const [log] = await db.insert(usageLogs).values(values).returning();
    const ingestionMs = computeFreshnessMs(normalized.createdAt, ingestedAt);
    return { log, ingestionMs };
}

export function isFreshEnough(
    createdAt: Date,
    maxLagMs: number,
    ingestedAt: Date = new Date()
): boolean {
    return computeFreshnessMs(createdAt, ingestedAt) <= maxLagMs;
}

