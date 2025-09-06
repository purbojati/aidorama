import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { user } from "../db/schema/auth";
import {
	characters,
	chatMessages,
	chatSessions,
} from "../db/schema/characters";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { ensureUniqueUsername, generateUsername } from "../lib/utils";
import { TRPCError } from "@trpc/server";
import { CHARACTER_TAG_OPTIONS } from "@/lib/character-tags";

// Dev-only access bypass for debugging
// Enable by setting AIDORAMA_DEBUG_BYPASS_ACCESS=true in .env.local
// This is ignored in production regardless of the flag
const BYPASS_ACCESS =
	process.env.NODE_ENV !== "production" &&
	process.env.AIDORAMA_DEBUG_BYPASS_ACCESS === "true";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// User management procedures
	user: router({
		// Get current user profile
		getProfile: protectedProcedure.query(async ({ ctx }) => {
			const userData = await db
				.select()
				.from(user)
				.where(eq(user.id, ctx.session.user.id))
				.limit(1);
			return userData[0] || null;
		}),

		// Get email by username (for login)
		getEmailByUsername: publicProcedure
			.input(
				z.object({
					username: z.string().min(1, "Username is required"),
				}),
			)
			.query(async ({ input }) => {
				const userData = await db
					.select({ email: user.email })
					.from(user)
					.where(eq(user.username, input.username))
					.limit(1);

				if (!userData[0]) {
					throw new Error("Username tidak ditemukan");
				}

				return { email: userData[0].email };
			}),

		// Generate username for current user
		generateUsername: protectedProcedure.mutation(async ({ ctx }) => {
			try {
				// Get current user data
				const currentUser = await db
					.select()
					.from(user)
					.where(eq(user.id, ctx.session.user.id))
					.limit(1);

				if (!currentUser[0]) {
					throw new Error("User not found");
				}

				// Skip if user already has username
				if (currentUser[0].username) {
					return { username: currentUser[0].username, generated: false };
				}

				// Generate username
				const baseUsername = generateUsername(
					currentUser[0].name,
					currentUser[0].email,
				);

				// Check if username exists function
				const checkExists = async (username: string) => {
					const existing = await db
						.select({ id: user.id })
						.from(user)
						.where(eq(user.username, username))
						.limit(1);
					return existing.length > 0;
				};

				// Ensure username is unique
				const uniqueUsername = await ensureUniqueUsername(
					baseUsername,
					checkExists,
				);

				// Update user with generated username
				const _updatedUser = await db
					.update(user)
					.set({ username: uniqueUsername })
					.where(eq(user.id, currentUser[0].id))
					.returning();

				return { username: uniqueUsername, generated: true };
			} catch (error: any) {
				throw new Error(error.message || "Gagal membuat username");
			}
		}),

		// Update user profile
		updateProfile: protectedProcedure
			.input(
				z.object({
					name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
					displayName: z
						.string()
						.min(2, "Nama tampilan minimal 2 karakter")
						.optional(),
					bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				try {
					const _updatedUser = await db
						.update(user)
						.set({
							name: input.name,
							displayName: input.displayName || null,
							bio: input.bio || null,
							updatedAt: new Date(),
						})
						.where(eq(user.id, ctx.session.user.id))
						.returning();

					if (!_updatedUser[0]) {
						throw new Error("Gagal memperbarui profil");
					}

					return _updatedUser[0];
				} catch (error: any) {
					throw new Error(error.message || "Gagal memperbarui profil");
				}
			}),
	}),

	// Character management procedures
	characters: router({
		// Get user's characters
		getUserCharacters: protectedProcedure.query(async ({ ctx }) => {
			return await db
				.select()
				.from(characters)
				.where(eq(characters.userId, ctx.session.user.id))
				.orderBy(desc(characters.createdAt));
		}),

		// Get public characters
		getPublicCharacters: publicProcedure
			.input(
				z.object({
					search: z.string().optional(),
					limit: z.number().min(1).max(50).default(20),
					offset: z.number().min(0).default(0),
				}),
			)
			.query(async ({ input }) => {
				const baseCondition = eq(characters.isPublic, true);
				const searchCondition = input.search
					? or(
							like(characters.name, `%${input.search}%`),
							like(characters.synopsis, `%${input.search}%`),
							like(characters.description, `%${input.search}%`),
						)
					: undefined;

				const whereConditions = searchCondition
					? and(baseCondition, searchCondition)!
					: baseCondition;

				return await db
					.select({
						id: characters.id,
						name: characters.name,
						synopsis: characters.synopsis,
						description: characters.description,
						avatarUrl: characters.avatarUrl,
						characterTags: characters.characterTags,
						isPublic: characters.isPublic,
						createdAt: characters.createdAt,
						user: {
							name: user.name,
							displayName: user.displayName,
							username: user.username,
						},
					})
					.from(characters)
					.leftJoin(user, eq(characters.userId, user.id))
					.where(whereConditions)
					.orderBy(desc(characters.createdAt))
					.limit(input.limit)
					.offset(input.offset);
			}),

		// Get character by ID
		getCharacter: publicProcedure
			.input(
				z.object({
					id: z.number(),
				}),
			)
			.query(async ({ ctx, input }) => {
				const character = await db
					.select()
					.from(characters)
					.where(eq(characters.id, input.id))
					.limit(1);

				if (!character[0]) {
					throw new Error("Karakter tidak ditemukan");
				}

				const char = character[0];

				// If character is public, anyone can view it
				if (char.isPublic) {
					return char;
				}

				// For private characters, user must be logged in and be the owner
				if (BYPASS_ACCESS) {
					return char;
				}

				if (!ctx.session?.user) {
					throw new Error("Anda harus login untuk melihat karakter ini.");
				}

				if (char.userId !== ctx.session.user.id) {
					throw new Error("Anda tidak memiliki akses ke karakter ini");
				}

				return char;
			}),

		// Create character
		createCharacter: protectedProcedure
			.input(
				z.object({
					name: z
						.string()
						.min(1, "Nama karakter wajib diisi")
						.max(100, "Nama karakter maksimal 100 karakter"),
					synopsis: z
						.string()
						.min(1, "Synopsis wajib diisi")
						.max(1000, "Synopsis maksimal 1000 karakter"),
					description: z
						.string()
						.min(1, "Deskripsi wajib diisi")
						.max(2000, "Deskripsi maksimal 2000 karakter"),
					greetings: z
						.string()
						.min(1, "Greetings wajib diisi")
						.max(500, "Greetings maksimal 500 karakter"),
					characterHistory: z
						.string()
						.max(3000, "Character history maksimal 3000 karakter")
						.optional(),
					personality: z
						.string()
						.max(2000, "Kepribadian maksimal 2000 karakter")
						.optional(),
					backstory: z
						.string()
						.max(3000, "Latar belakang maksimal 3000 karakter")
						.optional(),
					avatarUrl: z
						.string()
						.optional()
						.refine(
							(val) =>
								!val ||
								val.trim() === "" ||
								z.string().url().safeParse(val).success,
							"URL avatar tidak valid",
						),
					defaultUserRoleName: z
						.string()
						.max(100, "Nama role maksimal 100 karakter")
						.optional(),
					defaultUserRoleDetails: z
						.string()
						.max(500, "Detail role maksimal 500 karakter")
						.optional(),
					defaultSituationName: z
						.string()
						.max(100, "Nama situasi maksimal 100 karakter")
						.optional(),
					initialSituationDetails: z
						.string()
						.max(1000, "Detail situasi maksimal 1000 karakter")
						.optional(),
					characterTags: z.array(z.string()).default([]),
					complianceMode: z
						.enum(["strict", "standard", "obedient"])
						.default("standard"),
					isPublic: z.boolean().default(false),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				const newCharacter = await db
					.insert(characters)
					.values({
						...input,
						userId: ctx.session.user.id,
					})
					.returning();

				return newCharacter[0];
			}),

		// Update character
		updateCharacter: protectedProcedure
			.input(
				z.object({
					id: z.number(),
					name: z
						.string()
						.min(1, "Nama karakter wajib diisi")
						.max(100, "Nama karakter maksimal 100 karakter"),
					synopsis: z
						.string()
						.min(1, "Synopsis wajib diisi")
						.max(1000, "Synopsis maksimal 1000 karakter"),
					description: z
						.string()
						.min(1, "Deskripsi wajib diisi")
						.max(2000, "Deskripsi maksimal 2000 karakter"),
					greetings: z
						.string()
						.min(1, "Greetings wajib diisi")
						.max(500, "Greetings maksimal 500 karakter"),
					characterHistory: z
						.string()
						.max(3000, "Character history maksimal 3000 karakter")
						.optional(),
					personality: z
						.string()
						.max(2000, "Kepribadian maksimal 2000 karakter")
						.optional(),
					backstory: z
						.string()
						.max(3000, "Latar belakang maksimal 3000 karakter")
						.optional(),
					avatarUrl: z
						.string()
						.optional()
						.refine(
							(val) =>
								!val ||
								val.trim() === "" ||
								z.string().url().safeParse(val).success,
							"URL avatar tidak valid",
						),
					defaultUserRoleName: z
						.string()
						.max(100, "Nama role maksimal 100 karakter")
						.optional(),
					defaultUserRoleDetails: z
						.string()
						.max(500, "Detail role maksimal 500 karakter")
						.optional(),
					defaultSituationName: z
						.string()
						.max(100, "Nama situasi maksimal 100 karakter")
						.optional(),
					initialSituationDetails: z
						.string()
						.max(1000, "Detail situasi maksimal 1000 karakter")
						.optional(),
					characterTags: z.array(z.string()).default([]),
					complianceMode: z
						.enum(["strict", "standard", "obedient"])
						.default("standard"),
					isPublic: z.boolean(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Check if user owns character
				const existingCharacter = await db
					.select()
					.from(characters)
					.where(eq(characters.id, input.id))
					.limit(1);

				if (
					!existingCharacter[0] ||
					existingCharacter[0].userId !== ctx.session.user.id
				) {
					throw new Error(
						"Karakter tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				const updatedCharacter = await db
					.update(characters)
					.set({
						name: input.name,
						synopsis: input.synopsis,
						description: input.description,
						greetings: input.greetings,
						characterHistory: input.characterHistory,
						personality: input.personality,
						backstory: input.backstory,
						avatarUrl: input.avatarUrl,
						defaultUserRoleName: input.defaultUserRoleName,
						defaultUserRoleDetails: input.defaultUserRoleDetails,
						defaultSituationName: input.defaultSituationName,
						initialSituationDetails: input.initialSituationDetails,
						characterTags: input.characterTags,
						complianceMode: input.complianceMode,
						isPublic: input.isPublic,
						updatedAt: new Date(),
					})
					.where(eq(characters.id, input.id))
					.returning();

				return updatedCharacter[0];
			}),

		// Delete character
		deleteCharacter: protectedProcedure
			.input(
				z.object({
					id: z.number(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Check if user owns character
				const existingCharacter = await db
					.select()
					.from(characters)
					.where(eq(characters.id, input.id))
					.limit(1);

				if (
					!existingCharacter[0] ||
					existingCharacter[0].userId !== ctx.session.user.id
				) {
					throw new Error(
						"Karakter tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				await db.delete(characters).where(eq(characters.id, input.id));

				return { success: true };
			}),

		// Parse user input using AI to extract character data
		parseUserInput: protectedProcedure
			.input(
				z.object({
					userInput: z.string().min(1, "Input text is required"),
				}),
			)
			.mutation(async ({ input }) => {
				if (!process.env.OPENROUTER_API_KEY) {
					throw new Error("OpenRouter API key not configured");
				}

				const systemPrompt = `Konversi deskripsi karakter user ke JSON. Output JSON murni tanpa markdown. Bahasa Indonesia.

- Sudut pandang karakter untuk: greetings, defaultUserRoleName, defaultUserRoleDetails, defaultSituationName, initialSituationDetails.
- 'initialSituationDetails' pakai placeholder {{user}}.

JSON format (hanya field yang ada nilainya):
{
  "name": "string",
  "synopsis": "string",
  "description": "string",
  "greetings": "string",
  "characterHistory": "string",
  "personality": "string",
  "backstory": "string",
  "defaultUserRoleName": "string",
  "defaultUserRoleDetails": "string",
  "defaultSituationName": "string",
  "initialSituationDetails": "string",
  "isPublic": boolean
}`;

				try {
					const response = await fetch(
						"https://openrouter.ai/api/v1/chat/completions",
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
								"Content-Type": "application/json",
								"HTTP-Referer": "https://aidorama.app",
								"X-Title": "AIDorama",
							},
							body: JSON.stringify({
								model: "deepseek/deepseek-chat-v3.1",
								messages: [
									{ role: "system", content: systemPrompt },
									{ role: "user", content: input.userInput },
								],
								max_tokens: 2000,
								temperature: 0.3,
								stream: false,
							}),
						},
					);

					if (!response.ok) {
						const errorText = await response.text();
						console.error(`OpenRouter API Error: ${errorText}`);
						throw new Error("Gagal memproses input dengan AI");
					}

					const result = await response.json();
					const aiResponse = result.choices?.[0]?.message?.content;

					if (!aiResponse) {
						throw new Error("Tidak ada respons dari AI");
					}

					// Parse the JSON response
					try {
						// Clean the AI response - remove markdown code blocks and extra text
						let cleanedResponse = aiResponse.trim();

						// Remove markdown code blocks if present
						if (cleanedResponse.includes("```json")) {
							const jsonStart = cleanedResponse.indexOf("```json") + 7;
							const jsonEnd = cleanedResponse.lastIndexOf("```");
							cleanedResponse = cleanedResponse
								.substring(jsonStart, jsonEnd)
								.trim();
						} else if (cleanedResponse.includes("```")) {
							const jsonStart = cleanedResponse.indexOf("```") + 3;
							const jsonEnd = cleanedResponse.lastIndexOf("```");
							cleanedResponse = cleanedResponse
								.substring(jsonStart, jsonEnd)
								.trim();
						}

						// Try to find JSON object in the response
						const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
						if (jsonMatch) {
							cleanedResponse = jsonMatch[0];
						}

						const parsedData = JSON.parse(cleanedResponse);

						// Validate that we have an object
						if (typeof parsedData !== "object" || parsedData === null) {
							throw new Error("Response is not a valid object");
						}

						return parsedData;
					} catch (parseError) {
						console.error("Failed to parse AI response:", aiResponse);
						console.error("Parse error:", parseError);
						throw new Error(
							"Format respons AI tidak valid. Silakan coba lagi.",
						);
					}
				} catch (error: any) {
					console.error("AI parsing error:", error);
					throw new Error(error.message || "Gagal memproses input dengan AI");
				}
			}),
	}),

	// Chat management procedures
	chat: router({
		// Create new chat session
		createSession: protectedProcedure
			.input(
				z.object({
					characterId: z.number(),
					title: z.string().optional(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Verify character exists and is accessible
				const character = await db
					.select()
					.from(characters)
					.where(eq(characters.id, input.characterId))
					.limit(1);

				if (!character[0]) {
					throw new Error("Karakter tidak ditemukan");
				}

				// Check if user owns character or character is public
				if (
					!BYPASS_ACCESS &&
					character[0].userId !== ctx.session.user.id &&
					!character[0].isPublic
				) {
					throw new Error("Anda tidak memiliki akses ke karakter ini");
				}

				const newSession = await db
					.insert(chatSessions)
					.values({
						userId: ctx.session.user.id,
						characterId: input.characterId,
						title: input.title || `Chat dengan ${character[0].name}`,
					})
					.returning();

				// If character has greetings, add it as the first message
				if (character[0].greetings?.trim()) {
					await db.insert(chatMessages).values({
						sessionId: newSession[0].id,
						content: character[0].greetings.trim(),
						role: "assistant",
					});
				}

				return newSession[0];
			}),

		// Get or create session for a character (prevents multiple sessions)
		getOrCreateSession: protectedProcedure
			.input(
				z.object({
					characterId: z.number(),
					forceNew: z.boolean().optional().default(false),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Verify character exists and is accessible
				const character = await db
					.select()
					.from(characters)
					.where(eq(characters.id, input.characterId))
					.limit(1);

				if (!character[0]) {
					throw new Error("Karakter tidak ditemukan");
				}

				// Check if user owns character or character is public
				if (
					!BYPASS_ACCESS &&
					character[0].userId !== ctx.session.user.id &&
					!character[0].isPublic
				) {
					throw new Error("Anda tidak memiliki akses ke karakter ini");
				}

				// If forceNew is true, delete existing session first
				if (input.forceNew) {
					await db
						.delete(chatSessions)
						.where(
							and(
								eq(chatSessions.userId, ctx.session.user.id),
								eq(chatSessions.characterId, input.characterId),
							),
						);
				} else {
					// Check for existing session
					const existingSession = await db
						.select()
						.from(chatSessions)
						.where(
							and(
								eq(chatSessions.userId, ctx.session.user.id),
								eq(chatSessions.characterId, input.characterId),
							),
						)
						.orderBy(desc(chatSessions.updatedAt))
						.limit(1);

					if (existingSession[0]) {
						return existingSession[0];
					}
				}

				// Create new session
				const newSession = await db
					.insert(chatSessions)
					.values({
						userId: ctx.session.user.id,
						characterId: input.characterId,
						title: `Chat dengan ${character[0].name}`,
					})
					.returning();

				// If character has greetings, add it as the first message
				if (character[0].greetings?.trim()) {
					await db.insert(chatMessages).values({
						sessionId: newSession[0].id,
						content: character[0].greetings.trim(),
						role: "assistant",
					});
				}

				return newSession[0];
			}),

		// Get user's chat sessions
		getUserSessions: protectedProcedure.query(async ({ ctx }) => {
			const sessions = await db
				.select({
					id: chatSessions.id,
					title: chatSessions.title,
					createdAt: chatSessions.createdAt,
					updatedAt: chatSessions.updatedAt,
					character: {
						id: characters.id,
						name: characters.name,
						avatarUrl: characters.avatarUrl,
					},
				})
				.from(chatSessions)
				.innerJoin(characters, eq(chatSessions.characterId, characters.id))
				.where(eq(chatSessions.userId, ctx.session.user.id))
				.orderBy(desc(chatSessions.updatedAt));

			// Debug: Log the sessions to help identify the issue
			console.log("Fetched chat sessions:", sessions.map(s => ({
				id: s.id,
				characterName: s.character?.name,
				avatarUrl: s.character?.avatarUrl
			})));

			return sessions;
		}),

		// Find existing session for a character (to prevent duplicate sessions)
		findExistingSession: protectedProcedure
			.input(
				z.object({
					characterId: z.number(),
				}),
			)
			.query(async ({ ctx, input }) => {
				// Find the most recent session for this user-character combination
				const existingSession = await db
					.select({
						id: chatSessions.id,
						title: chatSessions.title,
						createdAt: chatSessions.createdAt,
						updatedAt: chatSessions.updatedAt,
					})
					.from(chatSessions)
					.where(
						and(
							eq(chatSessions.userId, ctx.session.user.id),
							eq(chatSessions.characterId, input.characterId),
						),
					)
					.orderBy(desc(chatSessions.updatedAt))
					.limit(1);

				return existingSession[0] || null;
			}),

		// Get messages for a session
		getSessionMessages: protectedProcedure
			.input(
				z.object({
					sessionId: z.number(),
				}),
			)
			.query(async ({ ctx, input }) => {
				// Verify user owns the session
				const session = await db
					.select()
					.from(chatSessions)
					.where(eq(chatSessions.id, input.sessionId))
					.limit(1);

				if (!session[0] || (!BYPASS_ACCESS && session[0].userId !== ctx.session.user.id)) {
					throw new Error(
						"Sesi chat tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				return await db
					.select()
					.from(chatMessages)
					.where(eq(chatMessages.sessionId, input.sessionId))
					.orderBy(chatMessages.createdAt);
			}),

		// Send message and get AI response
		sendMessage: protectedProcedure
			.input(
				z.object({
					sessionId: z.number(),
					content: z.string().min(1, "Pesan tidak boleh kosong"),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Verify user owns the session
				const sessionWithCharacter = await db
					.select({
						session: chatSessions,
						character: characters,
					})
					.from(chatSessions)
					.leftJoin(characters, eq(chatSessions.characterId, characters.id))
					.where(eq(chatSessions.id, input.sessionId))
					.limit(1);

				if (
					!sessionWithCharacter[0] ||
					(!BYPASS_ACCESS &&
						sessionWithCharacter[0].session.userId !== ctx.session.user.id)
				) {
					throw new Error(
						"Sesi chat tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				// Save user message
				const userMessage = await db
					.insert(chatMessages)
					.values({
						sessionId: input.sessionId,
						content: input.content,
						role: "user",
					})
					.returning();

				// Get recent messages for context
				const recentMessages = await db
					.select()
					.from(chatMessages)
					.where(eq(chatMessages.sessionId, input.sessionId))
					.orderBy(desc(chatMessages.createdAt))
					.limit(6);

				// Prepare messages for AI
				const character = sessionWithCharacter[0].character;
				if (!character) {
					throw new Error("Karakter tidak ditemukan");
				}

				const systemPrompt = `Anda ${character.name}.${character.description ? ` ${character.description}` : ""}${character.personality ? ` Kepribadian: ${character.personality}` : ""}${character.backstory ? ` Latar: ${character.backstory}` : ""} Respons konsisten, Bahasa Indonesia.`;

				const messages = [
					{ role: "system", content: systemPrompt },
					...recentMessages.reverse().map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
				];

				try {
					// Check if API key is configured
					if (!process.env.OPENROUTER_API_KEY) {
						throw new Error("OpenRouter API key not configured");
					}

					// Call OpenRouter API
					const response = await fetch(
						"https://openrouter.ai/api/v1/chat/completions",
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
								"Content-Type": "application/json",
								"HTTP-Referer": "https://aidorama.app",
								"X-Title": "AIDorama",
							},
							body: JSON.stringify({
								model: "deepseek/deepseek-chat-v3.1",
								messages,
								max_tokens: 3000,
								temperature: 0.7,
							}),
						},
					);

					if (!response.ok) {
						const errorText = await response.text();
						console.error(
							`OpenRouter API Error - Status: ${response.status}, Response: ${errorText}`,
						);
						throw new Error(
							`OpenRouter API Error (${response.status}): ${errorText}`,
						);
					}

					const aiResponse = await response.json();

					// Validate response structure
					if (
						!aiResponse.choices ||
						!Array.isArray(aiResponse.choices) ||
						aiResponse.choices.length === 0
					) {
						console.error("Invalid OpenRouter response structure:", aiResponse);
						throw new Error("Invalid response structure from OpenRouter API");
					}

					const aiContent =
						aiResponse.choices[0]?.message?.content ||
						"Maaf, saya tidak dapat merespons saat ini.";

					// Save AI response
					const aiMessage = await db
						.insert(chatMessages)
						.values({
							sessionId: input.sessionId,
							content: aiContent,
							role: "assistant",
						})
						.returning();

					// Update session timestamp
					await db
						.update(chatSessions)
						.set({ updatedAt: new Date() })
						.where(eq(chatSessions.id, input.sessionId));

					return {
						userMessage: userMessage[0],
						aiMessage: aiMessage[0],
					};
				} catch (error) {
					console.error("OpenRouter API Error:", error);

					// Save error message as AI response
					const errorMessage = await db
						.insert(chatMessages)
						.values({
							sessionId: input.sessionId,
							content:
								"Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
							role: "assistant",
						})
						.returning();

					return {
						userMessage: userMessage[0],
						aiMessage: errorMessage[0],
					};
				}
			}),

		// Delete chat session
		deleteSession: protectedProcedure
			.input(
				z.object({
					sessionId: z.number(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Verify user owns the session
				const session = await db
					.select()
					.from(chatSessions)
					.where(eq(chatSessions.id, input.sessionId))
					.limit(1);

				if (!session[0] || (!BYPASS_ACCESS && session[0].userId !== ctx.session.user.id)) {
					throw new Error(
						"Sesi chat tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				await db
					.delete(chatSessions)
					.where(eq(chatSessions.id, input.sessionId));

				return { success: true };
			}),

		// Reset chat session
		resetChat: protectedProcedure
			.input(
				z.object({
					sessionId: z.number(),
				}),
			)
			.mutation(async ({ ctx, input }) => {
				// Verify user owns the session
				const session = await db
					.select()
					.from(chatSessions)
					.where(eq(chatSessions.id, input.sessionId))
					.limit(1);

				if (!session[0] || (!BYPASS_ACCESS && session[0].userId !== ctx.session.user.id)) {
					throw new Error(
						"Sesi chat tidak ditemukan atau Anda tidak memiliki akses",
					);
				}

				await db
					.delete(chatMessages)
					.where(eq(chatMessages.sessionId, input.sessionId));

				return { success: true, message: "Chat berhasil direset." };
			}),
	}),

	// AI chat stream (this is not a tRPC procedure, but handled via a custom route)
});

export type AppRouter = typeof appRouter;
