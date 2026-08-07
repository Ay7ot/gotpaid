CREATE TABLE "drop_notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drop_id" uuid,
	"email" text,
	"whatsapp_number" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drop" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "drop"
SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "drop" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drop_notification" ADD CONSTRAINT "drop_notification_drop_id_drop_id_fk" FOREIGN KEY ("drop_id") REFERENCES "public"."drop"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drop_notification_drop_idx" ON "drop_notification" USING btree ("drop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drop_slug_unique" ON "drop" USING btree ("slug");
