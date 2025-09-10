// src/db/schema/characters.ts

import {
	boolean,
	integer,
	json,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const characters = pgTable("characters", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	synopsis: text("synopsis").notNull(),
	description: text("description").notNull(),
	greetings: text("greetings").notNull(),
	avatarUrl: text("avatar_url"),

	// Default user role fields
	defaultUserRoleAvatar: text("default_user_role_avatar"),
	defaultUserRoleName: text("default_user_role_name"),
	defaultUserRoleDetails: text("default_user_role_details"),

	// Default situation fields
	defaultSituationName: text("default_situation_name"),
	initialSituationDetails: text("initial_situation_details"),


	// Compliance mode for character behavior
	complianceMode: text("compliance_mode").default("standard").notNull(), // "standard", "obedient", "strict"

	isPublic: boolean("is_public").default(false).notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
	id: serial("id").primaryKey(),
	title: text("title"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	characterId: integer("character_id")
		.notNull()
		.references(() => characters.id, { onDelete: "cascade" }),
	// User interaction tracking
	conversationLength: integer("conversation_length").default(0).notNull(), // total messages in session
	lastUserMessage: timestamp("last_user_message"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	role: text("role").notNull(), // 'user' or 'assistant'
	sessionId: integer("session_id")
		.notNull()
		.references(() => chatSessions.id, { onDelete: "cascade" }),
	// Image upload fields
	imageUrl: text("image_url"), // URL of uploaded image in R2
	imageDescription: text("image_description"), // AI-generated description of the image
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
