import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { usageLogs } from "@/db/schema";
import {
    and,
    desc,
    eq,
    gte,
    ilike,
    inArray,
    lte,
    or,
    sql,
} from "drizzle-orm";
import { EVENT_TYPES, RECORD_TYPES, type EventType } from "@/types/usageLogs";

const MAX_EXPORT_ROWS = 10_000;
const RETENTION_DAYS = 90;

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

    const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(usageLogs)
        .where(where);
    const total = Number(count || 0);
    if (total > MAX_EXPORT_ROWS) {
        return NextResponse.json(
            {
                error: "Export too large",
                message: `Result set exceeds ${MAX_EXPORT_ROWS} rows. Narrow filters and retry.`,
            },
            { status: 413 }
        );
    }

    const rows = await db
        .select()
        .from(usageLogs)
        .where(where)
        .orderBy(desc(usageLogs.createdAt));

    const headers = [
        "id",
        "recordId",
        "recordType",
        "eventType",
        "actorId",
        "actorEmail",
        "recipientEmail",
        "status",
        "source",
        "createdAt",
        "ingestedAt",
    ];

    const csv = [
        headers.join(","),
        ...rows.map((r) =>
            headers
                .map((h) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const val = (r as any)[h] ?? "";
                    const str = typeof val === "string" ? val : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(",")
        ),
    ].join("\n");

    const response = new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="usage-logs-export.csv"`,
        },
    });
    response.headers.set("X-Total-Rows", `${total}`);
    response.headers.set("X-Retention-Days", `${RETENTION_DAYS}`);
    return response;
}

