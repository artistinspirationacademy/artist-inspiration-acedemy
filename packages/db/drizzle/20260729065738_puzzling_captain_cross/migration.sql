CREATE TABLE "attendance_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"attendance_month_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" text NOT NULL,
	"updated_by_role" text NOT NULL,
	"updated_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"enrollment_id" uuid NOT NULL,
	"month" date NOT NULL,
	"fee" numeric(10,2) DEFAULT '0' NOT NULL,
	"monthly_classes" integer DEFAULT 0 NOT NULL,
	"total_months" integer,
	"needs_rescheduling" boolean DEFAULT false NOT NULL,
	"notes" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"faculty_user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"teacher_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"monthly_fee" numeric(10,2) DEFAULT '0' NOT NULL,
	"monthly_classes" integer DEFAULT 0 NOT NULL,
	"total_months" integer,
	"start_month" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"serial_no" integer GENERATED ALWAYS AS IDENTITY (sequence name "students_serial_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"guardian_name" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_days_month_date_uidx" ON "attendance_days" ("attendance_month_id","date");--> statement-breakpoint
CREATE INDEX "attendance_days_date_idx" ON "attendance_days" ("date");--> statement-breakpoint
CREATE INDEX "attendance_days_attendance_month_id_idx" ON "attendance_days" ("attendance_month_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_months_enrollment_month_uidx" ON "attendance_months" ("enrollment_id","month");--> statement-breakpoint
CREATE INDEX "attendance_months_month_idx" ON "attendance_months" ("month");--> statement-breakpoint
CREATE INDEX "attendance_months_enrollment_id_idx" ON "attendance_months" ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "faculty_tokens_token_hash_uidx" ON "faculty_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "faculty_tokens_faculty_user_id_idx" ON "faculty_tokens" ("faculty_user_id");--> statement-breakpoint
CREATE INDEX "faculty_tokens_expires_at_idx" ON "faculty_tokens" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "faculty_users_teacher_id_uidx" ON "faculty_users" ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "faculty_users_email_uidx" ON "faculty_users" ("email");--> statement-breakpoint
CREATE INDEX "faculty_users_is_active_idx" ON "faculty_users" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "student_enrollments_student_teacher_course_uidx" ON "student_enrollments" ("student_id","teacher_id","course_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_student_id_idx" ON "student_enrollments" ("student_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_teacher_id_idx" ON "student_enrollments" ("teacher_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_course_id_idx" ON "student_enrollments" ("course_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_is_active_idx" ON "student_enrollments" ("is_active");--> statement-breakpoint
CREATE INDEX "student_enrollments_start_month_idx" ON "student_enrollments" ("start_month");--> statement-breakpoint
CREATE UNIQUE INDEX "students_serial_no_uidx" ON "students" ("serial_no");--> statement-breakpoint
CREATE UNIQUE INDEX "students_code_uidx" ON "students" ("code");--> statement-breakpoint
CREATE INDEX "students_name_idx" ON "students" ("name");--> statement-breakpoint
CREATE INDEX "students_is_active_idx" ON "students" ("is_active");--> statement-breakpoint
ALTER TABLE "attendance_days" ADD CONSTRAINT "attendance_days_attendance_month_id_attendance_months_id_fkey" FOREIGN KEY ("attendance_month_id") REFERENCES "attendance_months"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_months" ADD CONSTRAINT "attendance_months_enrollment_id_student_enrollments_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "faculty_tokens" ADD CONSTRAINT "faculty_tokens_faculty_user_id_faculty_users_id_fkey" FOREIGN KEY ("faculty_user_id") REFERENCES "faculty_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "faculty_users" ADD CONSTRAINT "faculty_users_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");