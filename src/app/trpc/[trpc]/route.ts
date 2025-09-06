import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createContext } from "@/lib/context";
import { appRouter } from "@/routers";

function handler(req: NextRequest) {
	return fetchRequestHandler({
		endpoint: "/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError: ({ error, path }) => {
			// Only log errors in development, not successful requests
			if (process.env.NODE_ENV === "development") {
				console.error(`tRPC error on ${path}:`, error);
			}
		},
	});
}
export { handler as GET, handler as POST };
