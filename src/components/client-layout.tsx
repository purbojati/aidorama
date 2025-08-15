"use client";

import { authClient } from "@/lib/auth-client";

interface ClientLayoutProps {
	children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
	return <>{children}</>;
} 