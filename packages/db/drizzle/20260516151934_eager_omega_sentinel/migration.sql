ALTER TABLE "configuration" ADD COLUMN "content_hours_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "configuration" ADD COLUMN "enable_booking" boolean DEFAULT true NOT NULL;