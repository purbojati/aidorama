/**
 * Next.js Instrumentation Hook
 * Runs on server startup (both development and production)
 */

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		// Initialize OpenRouter model discovery on boot
		const { initializeModelDiscovery } = await import('./src/lib/openrouter-discovery');
		await initializeModelDiscovery();
		console.log('✅ OpenRouter model discovery initialized');
	}
}

