ALTER TABLE "chat_sessions" ADD COLUMN "current_mood" text DEFAULT 'happy' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "mood_intensity" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "last_mood_change" timestamp DEFAULT now() NOT NULL;