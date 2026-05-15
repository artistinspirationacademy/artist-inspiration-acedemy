CREATE TABLE "about_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"type" text NOT NULL,
	"position" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "about_sections_position_idx" ON "about_sections" ("position");--> statement-breakpoint
CREATE INDEX "about_sections_type_idx" ON "about_sections" ("type");--> statement-breakpoint
CREATE INDEX "about_sections_is_active_idx" ON "about_sections" ("is_active");