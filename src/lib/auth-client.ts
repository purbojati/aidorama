import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	// For single app architecture, we don't need to specify baseURL
	// It will default to the current origin (same as the API)
});
