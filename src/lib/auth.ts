import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	// For single app architecture, we don't need CORS origins
	// trustedOrigins will default to the baseURL
	emailAndPassword: {
		enabled: true,
	},
	// Only enable social providers when credentials are present
	socialProviders: (() => {
		const googleClientId = process.env.GOOGLE_CLIENT_ID;
		const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
		const providers: Record<string, unknown> = {};
		
		if (googleClientId && googleClientSecret) {
			providers.google = {
				clientId: googleClientId,
				clientSecret: googleClientSecret,
			};
		}
		
		return providers;
	})(),
	secret: process.env.BETTER_AUTH_SECRET || "fallback-build-secret-not-for-production",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
