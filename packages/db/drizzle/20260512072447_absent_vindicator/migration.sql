CREATE TABLE "course_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"type" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "details";--> statement-breakpoint
CREATE INDEX "course_details_course_id_idx" ON "course_details" ("course_id");--> statement-breakpoint
CREATE INDEX "course_details_type_idx" ON "course_details" ("type");--> statement-breakpoint
CREATE INDEX "course_details_position_idx" ON "course_details" ("position");--> statement-breakpoint
ALTER TABLE "course_details" ADD CONSTRAINT "course_details_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");