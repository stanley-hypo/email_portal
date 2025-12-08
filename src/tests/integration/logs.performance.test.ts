import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/db";
import { usageLogs } from "@/db/schema";
import { eq, like } from "drizzle-orm";

type UsageLogInsert = typeof usageLogs.$inferInsert;

const PERF_RECORD_PREFIX = "perf-test-record";
const ROWS = 5000;

beforeAll(async () => {
    const now = new Date();
    const rows: UsageLogInsert[] = Array.from({ length: ROWS }).map((_, idx) => ({
        recordId: `${PERF_RECORD_PREFIX}-${idx}`,
        recordType: idx % 2 === 0 ? "email" : "pdf",
        eventType: idx % 2 === 0 ? "email_sent" : "pdf_view",
        recipientEmail: idx % 2 === 0 ? `user${idx}@example.com` : null,
        source: "perf-test",
        createdAt: now,
        ingestedAt: now,
    }));
    await db.insert(usageLogs).values(rows);
});

afterAll(async () => {
    await db
        .delete(usageLogs)
        .where(like(usageLogs.recordId, `${PERF_RECORD_PREFIX}%`));
});

describe("Usage logs performance", () => {
    it("returns recent 30-day email events within 3s for ~5k rows", async () => {
        const start = Date.now();
        const results = await db
            .select()
            .from(usageLogs)
            .where(eq(usageLogs.recordType, "email"))
            .limit(5000);
        const durationMs = Date.now() - start;
        expect(results.length).toBeGreaterThan(0);
        expect(durationMs).toBeLessThanOrEqual(3000);
    });
});

