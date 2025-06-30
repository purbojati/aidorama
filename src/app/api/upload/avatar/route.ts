import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateFileName, uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse form data
		const formData = await request.formData();
		const file = formData.get("avatar") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		const maxSize = 5 * 1024 * 1024; // 5MB

		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." },
				{ status: 400 },
			);
		}

		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "Ukuran file terlalu besar. Maksimal 5MB." },
				{ status: 400 },
			);
		}

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Generate unique filename
		const fileName = generateFileName(file.name);

		// Upload to R2 with compression
		const uploadResult = await uploadToR2(buffer, fileName, file.type);

		console.log(
			`📸 Avatar compressed: ${uploadResult.originalSize} → ${uploadResult.compressedSize} bytes (${uploadResult.compressionRatio}% reduction)`,
		);

		return NextResponse.json({
			success: true,
			url: uploadResult.url,
			fileName: fileName,
			compression: {
				originalSize: uploadResult.originalSize,
				compressedSize: uploadResult.compressedSize,
				compressionRatio: uploadResult.compressionRatio,
			},
		});
	} catch (error) {
		console.error("Avatar upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload avatar" },
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
