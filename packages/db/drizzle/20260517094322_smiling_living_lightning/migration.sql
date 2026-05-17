CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" text NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"booking_id" uuid,
	"metadata" jsonb,
	"read_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" ("status");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" ("type");--> statement-breakpoint
CREATE INDEX "notifications_booking_id_idx" ON "notifications" ("booking_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" ("created_at");