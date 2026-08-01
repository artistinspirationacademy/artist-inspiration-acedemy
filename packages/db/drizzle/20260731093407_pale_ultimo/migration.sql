CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"total_classes" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"position" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance_months" ADD COLUMN "academy_fee" numeric(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_months" ADD COLUMN "teacher_fee" numeric(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "platform_id" uuid;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "package_id" uuid;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "academy_fee" numeric(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "teacher_fee" numeric(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "classes_per_week" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_months" DROP COLUMN "fee";--> statement-breakpoint
ALTER TABLE "attendance_months" DROP COLUMN "needs_rescheduling";--> statement-breakpoint
ALTER TABLE "student_enrollments" DROP COLUMN "monthly_fee";--> statement-breakpoint
CREATE UNIQUE INDEX "packages_slug_uidx" ON "packages" ("slug");--> statement-breakpoint
CREATE INDEX "packages_is_active_idx" ON "packages" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_slug_uidx" ON "platforms" ("slug");--> statement-breakpoint
CREATE INDEX "platforms_position_idx" ON "platforms" ("position");--> statement-breakpoint
CREATE INDEX "platforms_is_active_idx" ON "platforms" ("is_active");--> statement-breakpoint
CREATE INDEX "student_enrollments_platform_id_idx" ON "student_enrollments" ("platform_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_package_id_idx" ON "student_enrollments" ("package_id");--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_platform_id_platforms_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_package_id_packages_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL;