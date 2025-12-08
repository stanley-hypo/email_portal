import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { usageLogs } from "@/db/schema";
import { GET as getLogs } from "@/app/api/logs/route";
import { GET as exportLogs } from "@/app/api/logs/export/route";
import { inArray } from "drizzle-orm";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

const recordIdA = "logs-test-record-a";
const recordIdB = "logs-test-record-b";

beforeAll(async () => {
    await db.insert(usageLogs).values([
        {
            recordId: recordIdA,
            recordType: "pdf",
            eventType: "pdf_view",
            source: "test",
        },
        {
            recordId: recordIdA,
            recordType: "pdf",
            eventType: "pdf_download",
            source: "test",
        },
        {
            recordId: recordIdB,
            recordType: "email",
            eventType: "email_sent",
            recipientEmail: "user@example.com",
            status: "queued",
            source: "test",
        },
        {
            recordId: recordIdB,
            recordType: "email",
            eventType: "email_delivered",
            recipientEmail: "user@example.com",
            status: "delivered",
            source: "test",
        },
    ]);
});

afterAll(async () => {
    await db
        .delete(usageLogs)
        .where(
            inArray(usageLogs.recordId, [recordIdA, recordIdB])
        );
});

describe("/api/logs filters", () => {
    it("returns only matching recordId and eventType", async () => {
        const req = new NextRequest(
            new Request(
                `http://localhost/api/logs?recordId=${recordIdA}&recordType=pdf&eventType=pdf_view`
            )
        );
        const res = await getLogs(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.items.length).toBe(1);
        expect(data.items[0].eventType).toBe("pdf_view");
    });

    it("filters by recipient email substring", async () => {
        const req = new NextRequest(
            new Request(
                `http://localhost/api/logs?recordType=email&recipient=user@example.com`
            )
        );
        const res = await getLogs(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.items.every((i: any) => i.recipientEmail?.includes("user"))).toBe(
            true
        );
    });
});

describe("/api/logs/export", () => {
    it("exports CSV with matching filters", async () => {
        const req = new NextRequest(
            new Request(
                `http://localhost/api/logs/export?recordType=pdf&recordId=${recordIdA}`
            )
        );
        const res = await exportLogs(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toContain("text/csv");
        const csv = await res.text();
        expect(csv).toContain("pdf_view");
        expect(csv).toContain("pdf_download");
    });
});

