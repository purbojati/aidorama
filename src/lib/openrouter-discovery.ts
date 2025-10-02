/**
 * OpenRouter Model Discovery & Fallback System
 * 
 * Features:
 * - Dynamic model discovery from OpenRouter API
 * - Endpoint probing and capability detection
 * - Intelligent model ranking and selection
 * - Fast fallback on errors
 * - Automatic cache refresh
 */

interface OpenRouterModel {
	id: string;
	name: string;
	pricing: {
		prompt: string;
		completion: string;
	};
	context_length: number;
	architecture?: {
		modality?: string;
		tokenizer?: string;
		instruct_type?: string | null;
	};
	top_provider?: {
		is_moderated: boolean;
		max_completion_tokens?: number | null;
	};
	per_request_limits?: {
		prompt_tokens?: string;
		completion_tokens?: string;
	} | null;
}

interface ModelEndpoint {
	id: string;
	provider: string;
	supports_tools?: boolean;
	supports_streaming?: boolean;
}

interface ModelCache {
	models: string[];
	timestamp: number;
	ttl: number; // in milliseconds
}

interface ModelMetadata {
	id: string;
	supportsTools: boolean;
	supportsStreaming: boolean;
	contextLength: number;
	checkedAt: number;
}

// In-memory cache
let modelCache: ModelCache | null = null;
let modelMetadataCache: Map<string, ModelMetadata> = new Map();

// Cache TTL: 1 hour in production, 5 minutes in development
const CACHE_TTL = process.env.NODE_ENV === "production" 
	? 60 * 60 * 1000  // 1 hour
	: 5 * 60 * 1000;  // 5 minutes

// Metadata cache TTL: 24 hours
const METADATA_TTL = 24 * 60 * 60 * 1000;

/**
 * Model selection policy - ranks DeepSeek models by preference
 */
function rankDeepSeekModels(models: OpenRouterModel[]): string[] {
	const deepseekModels = models.filter(m => 
		m.id.toLowerCase().includes('deepseek')
	);

	// Ranking criteria:
	// 1. R1 models (reasoning models) - highest priority
	// 2. V3/V3.2 models (latest version)
	// 3. Chat models
	// 4. Context length (higher is better)
	// 5. Pricing (lower is better)
	
	const ranked = deepseekModels.sort((a, b) => {
		// Prioritize R1 models
		const aIsR1 = a.id.toLowerCase().includes('r1');
		const bIsR1 = b.id.toLowerCase().includes('r1');
		if (aIsR1 && !bIsR1) return -1;
		if (!aIsR1 && bIsR1) return 1;

		// Prioritize V3.2 then V3
		const aIsV32 = a.id.toLowerCase().includes('v3.2');
		const bIsV32 = b.id.toLowerCase().includes('v3.2');
		if (aIsV32 && !bIsV32) return -1;
		if (!aIsV32 && bIsV32) return 1;

		const aIsV3 = a.id.toLowerCase().includes('v3');
		const bIsV3 = b.id.toLowerCase().includes('v3');
		if (aIsV3 && !bIsV3) return -1;
		if (!aIsV3 && bIsV3) return 1;

		// Prioritize chat models
		const aIsChat = a.id.toLowerCase().includes('chat');
		const bIsChat = b.id.toLowerCase().includes('chat');
		if (aIsChat && !bIsChat) return -1;
		if (!aIsChat && bIsChat) return 1;

		// Higher context length
		if (a.context_length !== b.context_length) {
			return b.context_length - a.context_length;
		}

		// Lower pricing
		const aPrice = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion);
		const bPrice = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion);
		return aPrice - bPrice;
	});

	return ranked.map(m => m.id);
}

/**
 * Fetch available models from OpenRouter
 */
async function fetchAvailableModels(): Promise<string[]> {
	try {
		const response = await fetch('https://openrouter.ai/api/v1/models', {
			headers: {
				'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
			},
		});

		if (!response.ok) {
			console.error(`Failed to fetch models: ${response.status}`);
			return [];
		}

		const data = await response.json();
		const models: OpenRouterModel[] = data.data || [];
		
		// Rank DeepSeek models by preference
		const rankedModels = rankDeepSeekModels(models);
		
		console.log(`✅ Discovered ${rankedModels.length} DeepSeek models:`, rankedModels.slice(0, 5));
		
		return rankedModels;
	} catch (error) {
		console.error('Error fetching models:', error);
		return [];
	}
}

/**
 * Probe model endpoints to check availability and capabilities
 */
async function probeModelEndpoints(modelId: string): Promise<ModelMetadata | null> {
	try {
		// Check cache first
		const cached = modelMetadataCache.get(modelId);
		if (cached && (Date.now() - cached.checkedAt < METADATA_TTL)) {
			return cached;
		}

		// Parse author and slug from model ID
		const [author, ...slugParts] = modelId.split('/');
		const slug = slugParts.join('/');

		const response = await fetch(
			`https://openrouter.ai/api/v1/models/${author}/${slug}/endpoints`,
			{
				headers: {
					'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
				},
			}
		);

		if (!response.ok) {
			console.warn(`❌ Model ${modelId} endpoints probe failed: ${response.status}`);
			return null;
		}

		const data = await response.json();
		const endpoints: ModelEndpoint[] = data.data || [];

		if (endpoints.length === 0) {
			console.warn(`❌ Model ${modelId} has no available endpoints`);
			return null;
		}

		// Check capabilities across all endpoints
		const supportsTools = endpoints.some(e => e.supports_tools !== false);
		const supportsStreaming = endpoints.some(e => e.supports_streaming !== false);

		const metadata: ModelMetadata = {
			id: modelId,
			supportsTools,
			supportsStreaming,
			contextLength: 0, // We don't get this from endpoints API
			checkedAt: Date.now(),
		};

		// Cache the metadata
		modelMetadataCache.set(modelId, metadata);

		console.log(`✅ Model ${modelId} probe: tools=${supportsTools}, streaming=${supportsStreaming}`);

		return metadata;
	} catch (error) {
		console.error(`Error probing model ${modelId}:`, error);
		return null;
	}
}

/**
 * Get cached models or fetch new ones
 */
async function getCachedModels(): Promise<string[]> {
	// Check if cache is valid
	if (modelCache && (Date.now() - modelCache.timestamp < modelCache.ttl)) {
		return modelCache.models;
	}

	// Fetch fresh models
	const models = await fetchAvailableModels();
	
	// Update cache
	modelCache = {
		models,
		timestamp: Date.now(),
		ttl: CACHE_TTL,
	};

	return models;
}

/**
 * Select the best available DeepSeek model
 * 
 * @param requireTools - Whether the model must support tool calling
 * @param requireStreaming - Whether the model must support streaming
 * @returns Model ID or null if none available
 */
export async function selectBestModel(
	requireTools = false,
	requireStreaming = true
): Promise<string | null> {
	const models = await getCachedModels();

	if (models.length === 0) {
		console.error('❌ No DeepSeek models available');
		return null;
	}

	// Try each model in order of preference
	for (const modelId of models) {
		const metadata = await probeModelEndpoints(modelId);
		
		if (!metadata) {
			// Model not available, try next
			continue;
		}

		// Check requirements
		if (requireTools && !metadata.supportsTools) {
			console.log(`⚠️ Model ${modelId} doesn't support tools, skipping`);
			continue;
		}

		if (requireStreaming && !metadata.supportsStreaming) {
			console.log(`⚠️ Model ${modelId} doesn't support streaming, skipping`);
			continue;
		}

		console.log(`✅ Selected model: ${modelId}`);
		return modelId;
	}

	// No model met all requirements, fallback to first available
	console.warn('⚠️ No model met all requirements, using first available');
	return models[0] || null;
}

/**
 * Call OpenRouter with automatic fallback
 * 
 * @param options - Request options
 * @param requireTools - Whether tools are required
 * @returns Response or null on failure
 */
export async function callWithFallback(
	options: {
		messages: any[];
		max_tokens?: number;
		temperature?: number;
		stream?: boolean;
		tools?: any[];
		tool_choice?: any;
	},
	requireTools = false
): Promise<Response | null> {
	const models = await getCachedModels();
	
	// Add fallback models
	const fallbackModels = [
		...models,
		'openrouter/auto', // OpenRouter's automatic routing
	];

	for (const modelId of fallbackModels) {
		try {
			// Remove tools if not required and model doesn't support them
			let requestBody = { ...options, model: modelId };
			
			if (!requireTools && modelId !== 'openrouter/auto') {
				const metadata = modelMetadataCache.get(modelId);
				if (metadata && !metadata.supportsTools) {
					const { tools, tool_choice, ...bodyWithoutTools } = requestBody;
					requestBody = bodyWithoutTools;
					console.log(`ℹ️ Removed tools for model ${modelId} (not supported)`);
				}
			}

			const response = await fetch(
				'https://openrouter.ai/api/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
						'Content-Type': 'application/json',
						'HTTP-Referer': 'https://aidorama.app',
						'X-Title': 'AiDorama',
					},
					body: JSON.stringify(requestBody),
				}
			);

			if (response.ok) {
				console.log(`✅ Request successful with model: ${modelId}`);
				return response;
			}

			// Handle specific error codes
			const status = response.status;
			if (status === 404 || status === 410) {
				console.warn(`⚠️ Model ${modelId} returned ${status}, trying next model`);
				// Remove from cache if it's not working
				if (modelCache) {
					modelCache.models = modelCache.models.filter(m => m !== modelId);
				}
				continue;
			}

			// For other errors, log and continue
			const errorText = await response.text();
			console.error(`❌ Model ${modelId} error ${status}: ${errorText}`);
			
			// If it's a server error (5xx), try next model
			if (status >= 500) {
				continue;
			}

			// For client errors (4xx), return the error
			return response;
		} catch (error) {
			console.error(`Error calling model ${modelId}:`, error);
			continue;
		}
	}

	console.error('❌ All models failed');
	return null;
}

/**
 * Refresh model cache (call this on app boot and periodically)
 */
export async function refreshModelCache(): Promise<void> {
	console.log('🔄 Refreshing OpenRouter model cache...');
	const models = await fetchAvailableModels();
	
	modelCache = {
		models,
		timestamp: Date.now(),
		ttl: CACHE_TTL,
	};

	console.log(`✅ Model cache refreshed: ${models.length} DeepSeek models`);
}

/**
 * Initialize the model discovery system
 */
export async function initializeModelDiscovery(): Promise<void> {
	console.log('🚀 Initializing OpenRouter model discovery...');
	await refreshModelCache();

	// In production, refresh hourly
	if (process.env.NODE_ENV === 'production') {
		setInterval(() => {
			refreshModelCache().catch(error => {
				console.error('Failed to refresh model cache:', error);
			});
		}, 60 * 60 * 1000); // 1 hour
	}
}

