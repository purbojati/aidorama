// Client-side image compression utility
export interface CompressionOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "jpeg" | "webp";
}

export interface CompressionResult {
	file: File;
	originalSize: number;
	compressedSize: number;
	compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
	maxWidth: 500,
	maxHeight: 500,
	quality: 0.8,
	format: "jpeg",
};

export async function compressImage(
	file: File,
	options: CompressionOptions = {},
): Promise<CompressionResult> {
	const config = { ...DEFAULT_OPTIONS, ...options };
	const originalSize = file.size;

	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		if (!ctx) {
			reject(new Error("Canvas not supported"));
			return;
		}

		img.onload = () => {
			// Calculate new dimensions
			let { width, height } = img;
			const aspectRatio = width / height;

			if (width > config.maxWidth! || height > config.maxHeight!) {
				if (aspectRatio > 1) {
					// Landscape
					width = Math.min(width, config.maxWidth!);
					height = width / aspectRatio;
				} else {
					// Portrait
					height = Math.min(height, config.maxHeight!);
					width = height * aspectRatio;
				}
			}

			// Set canvas size
			canvas.width = width;
			canvas.height = height;

			// Draw and compress image
			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Compression failed"));
						return;
					}

					const compressedFile = new File(
						[blob],
						file.name.replace(
							/\.[^/.]+$/,
							`.${config.format === "webp" ? "webp" : "jpg"}`,
						),
						{
							type: `image/${config.format}`,
							lastModified: Date.now(),
						},
					);

					const compressedSize = compressedFile.size;
					const compressionRatio = Math.round(
						((originalSize - compressedSize) / originalSize) * 100,
					);

					resolve({
						file: compressedFile,
						originalSize,
						compressedSize,
						compressionRatio: Math.max(0, compressionRatio),
					});
				},
				`image/${config.format}`,
				config.quality,
			);
		};

		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = URL.createObjectURL(file);
	});
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

export function isImageFile(file: File): boolean {
	return file.type.startsWith("image/");
}

export function validateImageFile(file: File): {
	valid: boolean;
	error?: string;
} {
	if (!isImageFile(file)) {
		return {
			valid: false,
			error: "File bukan gambar yang valid",
		};
	}

	const maxSize = 5 * 1024 * 1024; // 5MB (before compression)
	if (file.size > maxSize) {
		return {
			valid: false,
			error: "Ukuran file terlalu besar. Maksimal 5MB.",
		};
	}

	return { valid: true };
}
