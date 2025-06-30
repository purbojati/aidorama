import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import sharp from "sharp";

// R2 Configuration
const r2Client = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// Compression configuration
export const COMPRESSION_CONFIG = {
	maxWidth: 512,
	maxHeight: 512,
	quality: 80,
	format: "webp" as const,
};

// Compress image to reduce file size and standardize format
export async function compressImage(
	imageBuffer: Buffer,
	options: Partial<typeof COMPRESSION_CONFIG> = {},
): Promise<{
	buffer: Buffer;
	format: string;
	originalSize: number;
	compressedSize: number;
}> {
	const config = { ...COMPRESSION_CONFIG, ...options };
	const originalSize = imageBuffer.length;

	try {
		const compressedBuffer = await sharp(imageBuffer)
			.resize(config.maxWidth, config.maxHeight, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({
				quality: config.quality,
				effort: 6, // Higher effort for better compression
			})
			.toBuffer();

		return {
			buffer: compressedBuffer,
			format: "webp",
			originalSize,
			compressedSize: compressedBuffer.length,
		};
	} catch (error) {
		console.error("Image compression failed:", error);
		throw new Error("Failed to compress image");
	}
}

// Generate a unique file name
export function generateFileName(originalName: string): string {
	const timestamp = Date.now();
	const randomString = randomBytes(8).toString("hex");

	// Sanitize the original name
	const safeName = originalName
		.replace(/\.[^/.]+$/, "") // Remove extension
		.replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with dash
		.toLowerCase()
		.slice(0, 20); // Limit length

	// Always use .webp since we compress to WebP format
	return `avatars/${timestamp}-${randomString}-${safeName}.webp`;
}

// Upload file to R2 with compression
export async function uploadToR2(
	file: Buffer,
	fileName: string,
	originalContentType: string,
): Promise<{
	url: string;
	originalSize: number;
	compressedSize: number;
	compressionRatio: number;
}> {
	try {
		// Compress the image
		const compressionResult = await compressImage(file);

		const command = new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: fileName,
			Body: compressionResult.buffer,
			ContentType: "image/webp", // Always WebP after compression
			CacheControl: "public, max-age=31536000", // 1 year cache
		});

		await r2Client.send(command);

		const compressionRatio = Math.round(
			((compressionResult.originalSize - compressionResult.compressedSize) /
				compressionResult.originalSize) *
				100,
		);

		// Return the public URL and compression stats
		return {
			url: `${R2_PUBLIC_URL}/${fileName}`,
			originalSize: compressionResult.originalSize,
			compressedSize: compressionResult.compressedSize,
			compressionRatio,
		};
	} catch (error) {
		console.error("Error uploading to R2:", error);
		throw new Error("Failed to upload file to R2");
	}
}

// Generate presigned URL for direct upload (alternative approach)
export async function generatePresignedUrl(
	fileName: string,
	contentType: string,
): Promise<string> {
	try {
		const command = new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: fileName,
			ContentType: contentType,
		});

		const signedUrl = await getSignedUrl(r2Client, command, {
			expiresIn: 3600, // 1 hour
		});

		return signedUrl;
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		throw new Error("Failed to generate presigned URL");
	}
}

// Validate file type and size
export function validateAvatarFile(file: File): {
	valid: boolean;
	error?: string;
} {
	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	const maxSize = 5 * 1024 * 1024; // 5MB

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP.",
		};
	}

	if (file.size > maxSize) {
		return {
			valid: false,
			error: "Ukuran file terlalu besar. Maksimal 5MB.",
		};
	}

	return { valid: true };
}
