"use client";

import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { VersionRefreshNotification } from "./version-refresh-notification";
import { PosthogProvider } from "./posthog-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<Suspense fallback={null}>
					<PosthogProvider>
						{children}
					</PosthogProvider>
				</Suspense>
				<VersionRefreshNotification />
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
