"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		if (session) {
			router.push("/");
		}
	}, [session, router]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
			</div>
		);
	}

	if (session) {
		return null; // Will redirect to dashboard
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header with mode toggle */}
			<div className="flex items-center justify-between p-4 lg:p-6">
				<div className="flex items-center space-x-2">
					<img 
						src="/aidorama-logo-trans.png" 
						alt="Aidorama" 
						className="h-8 w-8" 
					/>
					<h1 className="font-bold text-xl lg:text-2xl">aidorama</h1>
				</div>
				<ModeToggle />
			</div>

			{/* Main content */}
			<div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
				<div className="w-full max-w-6xl">
					{isSignUp ? (
						<SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
					) : (
						<SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
					)}
				</div>
			</div>
		</div>
	);
}
