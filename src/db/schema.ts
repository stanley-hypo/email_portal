import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    uuid,
    boolean,
    pgEnum,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"), // Optional because OAuth users won't have a password
    isAdmin: boolean("isAdmin").default(false).notNull(),
});

export const accounts = pgTable(
    "account",
    {
        userId: uuid("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
);

// Usage logging
export const recordTypeEnum = pgEnum("record_type_enum", ["pdf", "email"]);

export const eventTypeEnum = pgEnum("event_type_enum", [
    "pdf_view",
    "pdf_download",
    "pdf_print",
    "email_sent",
    "email_delivered",
    "email_opened",
    "email_bounced",
    "email_failed",
]);

export const usageLogs = pgTable(
    "usage_logs",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        recordId: text("record_id").notNull(),
        recordType: recordTypeEnum("record_type").notNull(),
        eventType: eventTypeEnum("event_type").notNull(),
        actorId: uuid("actor_id"),
        actorEmail: text("actor_email"),
        recipientEmail: text("recipient_email"),
        status: text("status"),
        source: text("source"),
        metadata: jsonb("metadata").default({}).$type<Record<string, unknown>>(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        ingestedAt: timestamp("ingested_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (usageLogs) => ({
        recordIdx: index("usage_logs_record_idx").on(
            usageLogs.recordType,
            usageLogs.recordId,
            usageLogs.createdAt
        ),
        createdIdx: index("usage_logs_created_idx").on(usageLogs.createdAt),
        eventIdx: index("usage_logs_event_idx").on(
            usageLogs.eventType,
            usageLogs.recordType
        ),
        recipientIdx: index("usage_logs_recipient_idx").on(
            usageLogs.recipientEmail
        ),
    })
);
