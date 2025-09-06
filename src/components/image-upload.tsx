"use client";

import { ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
	onImageUpload: (imageUrl: string) => void;
	disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled = false }: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
			return;
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
			return;
		}

		// Upload file immediately
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload/chat-image", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Upload failed");
			}

			const result = await response.json();
			onImageUpload(result.url);
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Gagal mengupload gambar");
		} finally {
			setIsUploading(false);
		}
	};

	const handleClick = () => {
		if (!disabled && !isUploading) {
			fileInputRef.current?.click();
		}
	};

	return (
		<div className="relative">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled || isUploading}
			/>
			
			<Button
				type="button"
				size="icon"
				variant="ghost"
				onClick={handleClick}
				disabled={disabled || isUploading}
				className="h-10 w-10 rounded-full hover:bg-muted/50"
				title="Attach image"
			>
				{isUploading ? (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-b-transparent" />
				) : (
					<ImageIcon className="h-5 w-5 text-muted-foreground" />
				)}
			</Button>
		</div>
	);
}
