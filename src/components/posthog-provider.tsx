"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { authClient } from "@/lib/auth-client";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = authClient.useSession();

    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
            person_profiles: "identified_only",
            capture_pageview: false,
            autocapture: false,
            // Session replay is managed server-side in PostHog; this keeps only replay
            // and disables generic event autocapture in the client.
        });
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            posthog.identify(session.user.id, {
                name: session.user.name,
                email: session.user.email,
            });
        }
    }, [session]);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}


