ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teachers_position_idx" ON "teachers" ("position");