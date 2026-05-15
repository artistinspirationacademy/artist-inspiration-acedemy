ALTER TABLE "bookings" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
CREATE INDEX "bookings_teacher_id_idx" ON "bookings" ("teacher_id");