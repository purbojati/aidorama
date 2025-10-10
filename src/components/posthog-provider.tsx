"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initializePosthog, posthog } from "@/lib/posthog";

export function PosthogProvider() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        initializePosthog();
    }, []);

    useEffect(() => {
        // Track client-side route changes as pageviews
        // Avoid manual timestamp, PostHog records it automatically
        posthog.capture("$pageview");
    }, [pathname, searchParams]);

    return null;
}


