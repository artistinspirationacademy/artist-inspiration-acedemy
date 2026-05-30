ALTER TABLE "teachers" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "teachers_position_idx" ON "teachers" ("position");