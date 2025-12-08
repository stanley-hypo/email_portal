import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { usageLogs } from "@/db/schema";
import {
    and,
    desc,
    eq,
    gte,
    inArray,
    lte,
    or,
    sql,
    ilike,
} from "drizzle-orm";
import { RECORD_TYPES, EVENT_TYPES, type EventType } from "@/types/usageLogs";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const RETENTION_DAYS = 90; // surfaced for UI messaging; adjust if retention policy differs
const MAX_DATE_RANGE_DAYS = 365; // guardrail to prevent huge scans

type SortKey = "createdAt" | "eventType";
const SORTABLE: Record<
    SortKey,
    typeof usageLogs.createdAt | typeof usageLogs.eventType
> = {
    createdAt: usageLogs.createdAt,
    eventType: usageLogs.eventType,
};

function parseDate(value: string | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
    const session = await auth();
    const isAdmin = session?.user?.isAdmin === true;
    if (!session || !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId") || undefined;
    const recordType = (searchParams.get("recordType") ||
        undefined) as (typeof RECORD_TYPES)[number] | undefined;
    const eventTypeParam = searchParams.get("eventType") || undefined;
    const actor = searchParams.get("actor") || undefined;
    const recipient = searchParams.get("recipient") || undefined;
    const status = searchParams.get("status") || undefined;
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    const sortParam = searchParams.get("sort") || "createdAt:desc";
    const [sortKeyRaw, sortDirRaw] = sortParam.split(":");
    const sortKey = (sortKeyRaw as SortKey) || "createdAt";
    const sortDir = sortDirRaw === "asc" ? "asc" : "desc";

    const page = Math.max(
        DEFAULT_PAGE,
        Number.parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10) || 1
    );
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Number.parseInt(searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`, 10) ||
            DEFAULT_PAGE_SIZE
    );

    if (recordType && !RECORD_TYPES.includes(recordType)) {
        return NextResponse.json(
            { error: `Invalid recordType: ${recordType}` },
            { status: 400 }
        );
    }

    const allAllowedEvents: EventType[] = [
        ...EVENT_TYPES.pdf,
        ...EVENT_TYPES.email,
    ];
    const eventTypes: EventType[] =
        eventTypeParam?.split(",").filter(Boolean) as EventType[] | undefined ||
        [];
    if (eventTypes.length) {
        const allowed = recordType ? EVENT_TYPES[recordType] : allAllowedEvents;
        const invalid = eventTypes.filter((e) => !allowed.includes(e));
        if (invalid.length) {
            return NextResponse.json(
                {
                    error: `Invalid eventType(s)${
                        recordType ? ` for ${recordType}` : ""
                    }: ${invalid.join(",")}`,
                },
                { status: 400 }
            );
        }
    }

    if (from && to) {
        const diffDays =
            (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > MAX_DATE_RANGE_DAYS) {
            return NextResponse.json(
                { error: "Date range too large; please narrow the window." },
                { status: 400 }
            );
        }
    }

    const filters = [];
    if (recordId) filters.push(eq(usageLogs.recordId, recordId));
    if (recordType) filters.push(eq(usageLogs.recordType, recordType));
    if (eventTypes.length) filters.push(inArray(usageLogs.eventType, eventTypes));
    if (actor) {
        filters.push(
            or(
                ilike(usageLogs.actorEmail, `%${actor}%`),
                eq(usageLogs.actorId, actor)
            )
        );
    }
    if (recipient) {
        filters.push(ilike(usageLogs.recipientEmail, `%${recipient}%`));
    }
    if (status) filters.push(ilike(usageLogs.status, `%${status}%`));
    if (from) filters.push(gte(usageLogs.createdAt, from));
    if (to) filters.push(lte(usageLogs.createdAt, to));

    const where = filters.length ? and(...filters) : undefined;
    const offset = (page - 1) * pageSize;
    const sortColumn = SORTABLE[sortKey] ?? usageLogs.createdAt;

    const [items, totalResult] = await Promise.all([
        db
            .select()
            .from(usageLogs)
            .where(where)
            .orderBy(sortDir === "asc" ? sortColumn : desc(sortColumn))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: sql<number>`COUNT(*)` })
            .from(usageLogs)
            .where(where),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
        items,
        page,
        pageSize,
        total,
        retentionDays: RETENTION_DAYS,
        lastUpdated: new Date().toISOString(),
        sort: `${sortKey}:${sortDir}`,
    });
}

