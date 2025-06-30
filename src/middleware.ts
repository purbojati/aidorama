import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	// For single app architecture, we don't need CORS headers
	// since the API and frontend are served from the same origin
	const res = NextResponse.next();

	// You can add other middleware logic here if needed
	// (e.g., authentication checks, redirects, etc.)

	return res;
}

export const config = {
	// Only run middleware on API routes if needed
	matcher: [
		// Skip all internal paths (_next) and image files
		"/((?!_next/static|_next/image|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff|tif|avif|heic|heif)$).*)",
	],
};
