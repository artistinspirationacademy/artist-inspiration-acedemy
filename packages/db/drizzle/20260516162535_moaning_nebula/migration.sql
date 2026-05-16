CREATE TABLE "log_archives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"entry_count" integer DEFAULT 0 NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "configuration" ADD COLUMN "redis_log_retention_days" integer DEFAULT 7 NOT NULL;--> statement-breakpoint
ALTER TABLE "configuration" ADD COLUMN "archive_retention_days" integer DEFAULT 365 NOT NULL;--> statement-breakpoint
CREATE INDEX "log_archives_period_start_idx" ON "log_archives" ("period_start");--> statement-breakpoint
CREATE INDEX "log_archives_created_at_idx" ON "log_archives" ("created_at");