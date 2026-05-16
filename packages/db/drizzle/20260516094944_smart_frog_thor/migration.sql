ALTER TABLE "features" ADD COLUMN "position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "avatar_key" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ALTER COLUMN "course_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "features_position_idx" ON "features" ("position");--> statement-breakpoint
CREATE INDEX "testimonials_position_idx" ON "testimonials" ("position");--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_course_id_courses_id_fkey", ADD CONSTRAINT "testimonials_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL;