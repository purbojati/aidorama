import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { compressImage, generateFileName, uploadToR2, validateAvatarFile } from "../../../../lib/r2";

export async function POST(request: NextRequest) {
	try {
		// Get session from auth
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file
		const validation = validateAvatarFile(file);
		if (!validation.valid) {
			return NextResponse.json({ error: validation.error }, { status: 400 });
		}

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate unique filename for chat images
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 10);
		const safeName = file.name
			.replace(/\.[^/.]+$/, "") // Remove extension
			.replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with dash
			.toLowerCase()
			.slice(0, 20); // Limit length

		const fileName = `chat-img/${timestamp}-${randomString}-${safeName}.jpg`;

		// Upload to R2
		const uploadResult = await uploadToR2(
			buffer,
			fileName,
			file.type,
		);

		return NextResponse.json({
			url: uploadResult.url,
			fileName,
			originalSize: uploadResult.originalSize,
			compressedSize: uploadResult.compressedSize,
			compressionRatio: uploadResult.compressionRatio,
		});
	} catch (error) {
		console.error("Chat image upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload image" },
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
