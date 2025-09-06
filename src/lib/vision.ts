// Vision model integration for image description

export async function describeImage(imageUrl: string): Promise<string> {
	try {
		// Check if API key is configured
		if (!process.env.OPENROUTER_API_KEY) {
			throw new Error("OpenRouter API key not configured");
		}

		// Try multiple vision models in order of preference
		const visionModels = [
			"google/gemini-2.0-flash-001"
		];

		let lastError: Error | null = null;

		for (const model of visionModels) {
			try {
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
						body: JSON.stringify({
							model: model,
							messages: [
								{
									role: "user",
									content: [
										{
											type: "text",
											text: "Deskripsikan gambar ini dalam satu paragraf singkat dalam bahasa Indonesia. Fokus pada objek utama dan suasana yang terlihat."
										},
										{
											type: "image_url",
											image_url: {
												url: imageUrl
											}
										}
									]
								}
							],
							max_tokens: 500,
							temperature: 0.7,
						}),
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error(`Vision API Error with ${model} - Status: ${response.status}, Response: ${errorText}`);
					lastError = new Error(`Vision API Error: ${errorText}`);
					continue; // Try next model
				}

				const data = await response.json();
				const description = data.choices?.[0]?.message?.content;

				if (!description) {
					lastError = new Error("No description generated");
					continue; // Try next model
				}

				return description.trim();
			} catch (error) {
				console.error(`Error with vision model ${model}:`, error);
				lastError = error as Error;
				continue; // Try next model
			}
		}

		// If all models failed, throw the last error
		throw lastError || new Error("All vision models failed");
	} catch (error) {
		console.error("Error describing image:", error);
		throw new Error("Failed to describe image");
	}
}
