CREATE TYPE "public"."event_type_enum" AS ENUM('pdf_view', 'pdf_download', 'pdf_print', 'email_sent', 'email_delivered', 'email_opened', 'email_bounced', 'email_failed');--> statement-breakpoint
CREATE TYPE "public"."record_type_enum" AS ENUM('pdf', 'email');--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" text NOT NULL,
	"record_type" "record_type_enum" NOT NULL,
	"event_type" "event_type_enum" NOT NULL,
	"actor_id" uuid,
	"actor_email" text,
	"recipient_email" text,
	"status" text,
	"source" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "usage_logs_record_idx" ON "usage_logs" USING btree ("record_type","record_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_logs_created_idx" ON "usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "usage_logs_event_idx" ON "usage_logs" USING btree ("event_type","record_type");--> statement-breakpoint
CREATE INDEX "usage_logs_recipient_idx" ON "usage_logs" USING btree ("recipient_email");