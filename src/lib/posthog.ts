"use client";

import posthog from "posthog-js";

let posthogInitialized = false;

export function initializePosthog(): void {
    if (posthogInitialized) return;
    if (typeof window === "undefined") return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!apiKey) return;

    posthog.init(apiKey, {
        api_host: apiHost || "https://us.i.posthog.com",
        autocapture: true,
        capture_pageview: false,
        persistence: "localStorage+cookie",
    });

    posthogInitialized = true;
}

export { posthog };


