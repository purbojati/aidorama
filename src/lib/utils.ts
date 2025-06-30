import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generate a unique username based on name and email
 */
export function generateUsername(name: string, email: string): string {
	// Clean and format the name
	const cleanName = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "") // Remove special characters
		.slice(0, 8); // Take first 8 characters

	// Get email prefix
	const emailPrefix = email
		.split("@")[0]
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.slice(0, 6);

	// Generate random suffix
	const randomSuffix = Math.floor(Math.random() * 9999)
		.toString()
		.padStart(4, "0");

	// Try name-based username first, fall back to email-based
	const baseUsername = cleanName || emailPrefix || "user";

	return `${baseUsername}${randomSuffix}`;
}

/**
 * Ensure username is unique by adding incremental numbers if needed
 */
export async function ensureUniqueUsername(
	baseUsername: string,
	checkExists: (username: string) => Promise<boolean>,
): Promise<string> {
	let username = baseUsername;
	let counter = 1;

	while (await checkExists(username)) {
		username = `${baseUsername}${counter}`;
		counter++;

		// Safety check to prevent infinite loop
		if (counter > 999) {
			const randomSuffix = Math.floor(Math.random() * 99999);
			username = `user${randomSuffix}`;
			break;
		}
	}

	return username;
}
