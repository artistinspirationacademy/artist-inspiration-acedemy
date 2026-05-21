ALTER TABLE "course_categories" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "course_categories_position_idx" ON "course_categories" ("position");