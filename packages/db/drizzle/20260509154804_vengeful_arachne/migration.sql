CREATE TABLE "banner_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"media_key" text NOT NULL,
	"media_type" text NOT NULL,
	"position" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"course_id" uuid NOT NULL,
	"experience_level" text NOT NULL,
	"country" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"learner_count" integer DEFAULT 0 NOT NULL,
	"country_count" integer DEFAULT 0 NOT NULL,
	"teacher_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"about" jsonb DEFAULT '[]' NOT NULL,
	"image_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"alt" text,
	"key" text NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"name" text NOT NULL,
	"about" text NOT NULL,
	"image_key" text NOT NULL,
	"rating" integer NOT NULL,
	"experience" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"feedback" text NOT NULL,
	"course_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"country" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_category_id_course_categories_id_fkey" FOREIGN KEY ("course_category_id") REFERENCES "course_categories"("id");--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");