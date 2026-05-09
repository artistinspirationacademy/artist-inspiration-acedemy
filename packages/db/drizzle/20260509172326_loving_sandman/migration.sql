ALTER TABLE "course_categories" DROP CONSTRAINT "course_categories_slug_key";--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_key_key" UNIQUE("key");--> statement-breakpoint
CREATE INDEX "banners_position_idx" ON "banners" ("position");--> statement-breakpoint
CREATE INDEX "banners_is_active_idx" ON "banners" ("is_active");--> statement-breakpoint
CREATE INDEX "banners_media_type_idx" ON "banners" ("media_type");--> statement-breakpoint
CREATE INDEX "bookings_course_id_idx" ON "bookings" ("course_id");--> statement-breakpoint
CREATE INDEX "bookings_email_idx" ON "bookings" ("email");--> statement-breakpoint
CREATE INDEX "bookings_timestamp_idx" ON "bookings" ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "course_categories_slug_uidx" ON "course_categories" ("slug");--> statement-breakpoint
CREATE INDEX "course_categories_is_active_idx" ON "course_categories" ("is_active");--> statement-breakpoint
CREATE INDEX "courses_course_category_id_idx" ON "courses" ("course_category_id");--> statement-breakpoint
CREATE INDEX "courses_is_active_idx" ON "courses" ("is_active");--> statement-breakpoint
CREATE INDEX "features_is_active_idx" ON "features" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "media_key_uidx" ON "media" ("key");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" ("type");--> statement-breakpoint
CREATE INDEX "teachers_course_id_idx" ON "teachers" ("course_id");--> statement-breakpoint
CREATE INDEX "teachers_is_active_idx" ON "teachers" ("is_active");--> statement-breakpoint
CREATE INDEX "testimonials_course_id_idx" ON "testimonials" ("course_id");--> statement-breakpoint
CREATE INDEX "testimonials_is_active_idx" ON "testimonials" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "users" ("email");