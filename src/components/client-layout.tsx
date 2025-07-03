"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";

interface ClientLayoutProps {
	children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
	const { data: session } = authClient.useSession();

	// PostHog user identification
	useEffect(() => {
		if (session?.user) {
			posthog.identify(session.user.id, {
				email: session.user.email,
				name: session.user.name,
				email_verified: session.user.emailVerified,
				has_image: !!session.user.image,
				image_url: session.user.image || null
			});
		}
	}, [session]);

	return <>{children}</>;
} 