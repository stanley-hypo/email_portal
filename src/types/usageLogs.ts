export type RecordType = "pdf" | "email";

export type PdfEventType = "pdf_view" | "pdf_download" | "pdf_print";
export type EmailEventType =
    | "email_sent"
    | "email_delivered"
    | "email_opened"
    | "email_bounced"
    | "email_failed";
export type EventType = PdfEventType | EmailEventType;

export const RECORD_TYPES: RecordType[] = ["pdf", "email"];

export const EVENT_TYPES: Record<RecordType, EventType[]> = {
    pdf: ["pdf_view", "pdf_download", "pdf_print"],
    email: [
        "email_sent",
        "email_delivered",
        "email_opened",
        "email_bounced",
        "email_failed",
    ],
};

export type UsageLogSource = "portal" | "worker" | "api" | string;

export interface LogUsageEventInput {
    recordId: string;
    recordType: RecordType;
    eventType: EventType;
    actorId?: string;
    actorEmail?: string;
    recipientEmail?: string;
    status?: string;
    source: UsageLogSource;
    metadata?: Record<string, unknown>;
    createdAt?: Date | string;
}

export interface NormalizedLogUsageEvent extends LogUsageEventInput {
    metadata: Record<string, unknown>;
    createdAt: Date;
}

export function assertValidEvent(input: LogUsageEventInput): void {
    if (!input.recordId) throw new Error("recordId is required");
    if (!RECORD_TYPES.includes(input.recordType)) {
        throw new Error(`Invalid recordType: ${input.recordType}`);
    }
    const allowedEvents = EVENT_TYPES[input.recordType];
    if (!allowedEvents.includes(input.eventType)) {
        throw new Error(
            `Invalid eventType ${input.eventType} for recordType ${input.recordType}`
        );
    }
    if (input.recordType === "email" && !input.recipientEmail) {
        throw new Error("recipientEmail is required for email events");
    }
}

export function normalizeLogEvent(
    input: LogUsageEventInput
): NormalizedLogUsageEvent {
    assertValidEvent(input);
    const createdAt =
        input.createdAt instanceof Date
            ? input.createdAt
            : input.createdAt
              ? new Date(input.createdAt)
              : new Date();
    return {
        ...input,
        metadata: input.metadata ?? {},
        createdAt,
    };
}

export function computeFreshnessMs(
    createdAt: Date,
    ingestedAt: Date = new Date()
): number {
    return ingestedAt.getTime() - createdAt.getTime();
}

