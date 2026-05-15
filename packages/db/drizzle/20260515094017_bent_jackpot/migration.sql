CREATE TABLE "course_teachers" (
	"course_id" uuid,
	"teacher_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_teachers_pkey" PRIMARY KEY("course_id","teacher_id")
);
--> statement-breakpoint
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_course_id_courses_id_fkey";--> statement-breakpoint
DROP INDEX "teachers_course_id_idx";--> statement-breakpoint
ALTER TABLE "teachers" DROP COLUMN "course_id";--> statement-breakpoint
CREATE INDEX "course_teachers_course_id_idx" ON "course_teachers" ("course_id");--> statement-breakpoint
CREATE INDEX "course_teachers_teacher_id_idx" ON "course_teachers" ("teacher_id");--> statement-breakpoint
ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;