import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import {
	characters,
	chatMessages,
	chatSessions,
} from "../../../../db/schema/characters";
import { auth } from "../../../../lib/auth";
import { describeImage } from "../../../../lib/vision";
import { 
	calculateMood, 
	calculateMoodIntensity, 
	getMoodSystemPrompt, 
	calculateUserEngagement,
	getMoodTransitionMessage,
	type Mood,
	type MoodTriggers
} from "../../../../lib/mood-system";

// Dev-only access bypass for debugging
// Enable by setting AIDORAMA_DEBUG_BYPASS_ACCESS=true in .env.local
// This is ignored in production regardless of the flag
const BYPASS_ACCESS =
	process.env.NODE_ENV !== "production" &&
	process.env.AIDORAMA_DEBUG_BYPASS_ACCESS === "true";

export async function POST(request: NextRequest) {
	try {
		// Get session from auth
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (!authSession) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { sessionId, content, imageUrl, browserTime } = body;

		if (!sessionId || !content) {
			return NextResponse.json(
				{ error: "Missing sessionId or content" },
				{ status: 400 },
			);
		}

		// Verify user owns the session
		const sessionWithCharacter = await db
			.select({
				session: chatSessions,
				character: characters,
			})
			.from(chatSessions)
			.leftJoin(characters, eq(chatSessions.characterId, characters.id))
			.where(eq(chatSessions.id, sessionId))
			.limit(1);

		if (
			!sessionWithCharacter[0] ||
			(!BYPASS_ACCESS && sessionWithCharacter[0].session.userId !== authSession.user.id)
		) {
			return NextResponse.json(
				{ error: "Session not found or access denied" },
				{ status: 403 },
			);
		}

		// Generate image description if image is provided
		let imageDescription: string | null = null;
		if (imageUrl) {
			try {
				imageDescription = await describeImage(imageUrl);
			} catch (error) {
				console.error("Failed to describe image:", error);
				// Continue without description if vision fails - chat will still work
				imageDescription = "Gambar telah diupload namun deskripsi tidak dapat dibuat.";
			}
		}

		// Save user message with image data
		const userMessage = await db
			.insert(chatMessages)
			.values({
				sessionId: sessionId,
				content: content,
				role: "user",
				imageUrl: imageUrl || null,
				imageDescription: imageDescription,
			})
			.returning();

		// Get recent messages for context
		const recentMessages = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.sessionId, sessionId))
			.orderBy(desc(chatMessages.createdAt))
			.limit(8);

		// Get session data for mood calculation
		const sessionData = await db
			.select()
			.from(chatSessions)
			.where(eq(chatSessions.id, sessionId))
			.limit(1);

		const chatSession = sessionData[0];
		if (!chatSession) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 },
			);
		}

		// Calculate user engagement and mood triggers
		const moodCalculationTime = new Date();
		const timeSinceLastUserMessage = chatSession.lastUserMessage 
			? Math.floor((moodCalculationTime.getTime() - chatSession.lastUserMessage.getTime()) / (1000 * 60)) // minutes
			: 0;
		
		const userEngagement = calculateUserEngagement(
			chatSession.conversationLength || 0,
			chatSession.userResponseTime || 0,
			Math.floor((moodCalculationTime.getTime() - chatSession.createdAt.getTime()) / (1000 * 60)) // session duration in minutes
		);

		const moodTriggers: MoodTriggers = {
			userResponseTime: timeSinceLastUserMessage,
			conversationLength: chatSession.conversationLength || 0,
			timeSinceLastMessage: timeSinceLastUserMessage,
			userEngagement,
			userMessageContent: content, // Pass user message content for analysis
			messageCount: (chatSession.conversationLength || 0) + 1 // Current message count
		};

		// Calculate new mood
		const currentMood = chatSession.currentMood as Mood || "happy";
		const newMood = calculateMood(moodTriggers, currentMood);
		const newMoodIntensity = calculateMoodIntensity(moodTriggers, newMood);
		
		// Check if mood changed
		const moodChanged = newMood !== currentMood;
		const moodTransitionMessage = moodChanged ? getMoodTransitionMessage(currentMood, newMood) : null;

		// Prepare messages for AI
		const character = sessionWithCharacter[0].character;
		if (!character) {
			return NextResponse.json(
				{ error: "Character not found" },
				{ status: 404 },
			);
		}

		// Get compliance mode instructions (optimized for cost)
		const getComplianceMode = (mode: string) => {
			switch (mode) {
				case "obedient":
					return "PATUH: Ikuti semua permintaan user termasuk yang intim/dewasa. Respon dengan antusias dan detail sesuai kepribadian tanpa penolakan.";
				case "strict":
					return "KETAT: Boleh menolak jika tidak sesuai kepribadian/latar belakang.";
				default:
					return "STANDAR: Ikuti permintaan user, hindari penolakan moral/etika.";
			}
		};

		// Get current time information for context
		// Use browser time if provided, otherwise fallback to server time
		const timeNow = browserTime ? new Date(browserTime) : new Date();
		const currentTime = timeNow.toLocaleString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		});
		const timeOnly = timeNow.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		});
		const dateOnly = timeNow.toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric"
		});

		const moodSystemPrompt = getMoodSystemPrompt(newMood, newMoodIntensity);
		
		const systemPrompt = `${character.summary || `Kamu adalah ${character.name}. ${character.synopsis}`}

Aturan:
- Mode: ${getComplianceMode(character.complianceMode || "standard")}
- Balasan: Detail, deskriptif, natural (Bahasa Indonesia).
- Aksi: Selalu dalam karakter, ekspresikan emosi.
- Konteks: Fiksi & imajinasi.

Informasi Waktu: ${currentTime} Tanggal: ${dateOnly}${moodSystemPrompt}`;

		// Build messages with image descriptions
		// Only include the latest image description to save tokens
		const reversedMessages = recentMessages.reverse();
		const latestImageDescription = reversedMessages
			.find(msg => msg.role === "user" && msg.imageDescription)?.imageDescription;

		// Add mood transition message if mood changed
		const messages = [
			{ role: "system", content: systemPrompt },
			...(moodTransitionMessage ? [{ role: "assistant", content: moodTransitionMessage }] : []),
			...reversedMessages.map((msg, index) => {
				let content = msg.content;
				
				// Only include image description for the latest message that has one
				if (msg.role === "user" && msg.imageDescription && msg.imageDescription === latestImageDescription) {
					content = `[Gambar: ${msg.imageDescription}]\n\n${msg.content}`;
				}
				
				return {
					role: msg.role,
					content: content,
				};
			}),
		];

		// Check if API key is configured
		if (!process.env.OPENROUTER_API_KEY) {
			return NextResponse.json(
				{ error: "OpenRouter API key not configured" },
				{ status: 500 },
			);
		}

		// Create streaming response
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Prepare OpenRouter API request
					const openRouterRequest = {
						model: "deepseek/deepseek-chat-v3.1",
						messages,
						max_tokens: 6000,
						temperature: 0.8,
						stream: true, // Enable streaming
					};

					// Call OpenRouter API with streaming
					const response = await fetch(
						"https://openrouter.ai/api/v1/chat/completions",
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
								"Content-Type": "application/json",
								"HTTP-Referer": "https://aidorama.app",
								"X-Title": "AiDorama",
							},
							body: JSON.stringify(openRouterRequest),
						},
					);

					if (!response.ok) {
						const errorText = await response.text();
						console.error(
							`❌ [STREAM API] OpenRouter API Error - Status: ${response.status}, Response: ${errorText}`,
						);
						controller.error(new Error(`OpenRouter API Error: ${errorText}`));
						return;
					}

					const reader = response.body?.getReader();
					if (!reader) {
						controller.error(new Error("No response body reader"));
						return;
					}

					const decoder = new TextDecoder();
					let accumulatedContent = "";

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value, { stream: true });
						const lines = chunk.split("\n");

						for (const line of lines) {
							if (line.startsWith("data: ")) {
								const data = line.slice(6);
								if (data === "[DONE]") {
									// Save the complete AI response to database
									const aiMessage = await db
										.insert(chatMessages)
										.values({
											sessionId: sessionId,
											content:
												accumulatedContent ||
												"Maaf, saya tidak dapat merespons saat ini.",
											role: "assistant",
										})
										.returning();

									// Update session with mood data and user interaction tracking
									await db
										.update(chatSessions)
										.set({ 
											updatedAt: new Date(),
											currentMood: newMood,
											moodIntensity: newMoodIntensity,
											lastMoodChange: moodChanged ? new Date() : chatSession.lastMoodChange,
											conversationLength: (chatSession.conversationLength || 0) + 2, // +2 for user and AI message
											lastUserMessage: new Date(),
											userResponseTime: timeSinceLastUserMessage
										})
										.where(eq(chatSessions.id, sessionId));

									// Send final message with metadata
									controller.enqueue(
										encoder.encode(
											`data: ${JSON.stringify({
												type: "done",
												userMessage: userMessage[0],
												aiMessage: aiMessage[0],
											})}\n\n`,
										),
									);
									controller.close();
									return;
								}

								try {
									const parsed = JSON.parse(data);
									const delta = parsed.choices?.[0]?.delta?.content;

									if (delta) {
										accumulatedContent += delta;
										// Send the delta to the client
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													type: "delta",
													content: delta,
													accumulated: accumulatedContent,
												})}\n\n`,
											),
										);
									}
								} catch (_e) {
									// Ignore parsing errors for non-JSON lines
								}
							}
						}
					}
				} catch (error) {
					console.error("Streaming error:", error);

					// Save error message as AI response
					const errorMessage = await db
						.insert(chatMessages)
						.values({
							sessionId: sessionId,
							content:
								"Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
							role: "assistant",
						})
						.returning();

					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: "error",
								error: "Failed to get AI response",
								userMessage: userMessage[0],
								aiMessage: errorMessage[0],
							})}\n\n`,
						),
					);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("Chat stream error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
