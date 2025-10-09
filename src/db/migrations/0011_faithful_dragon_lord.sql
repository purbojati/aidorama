CREATE TABLE "chat_memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_memories" ADD CONSTRAINT "chat_memories_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;