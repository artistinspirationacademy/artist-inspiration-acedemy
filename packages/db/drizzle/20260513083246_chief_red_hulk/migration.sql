ALTER TABLE "courses" RENAME COLUMN "image_key" TO "card_image_key";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "cover_image_key" text NOT NULL;