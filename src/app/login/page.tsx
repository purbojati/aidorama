"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
					<h1 className="font-bold text-xl lg:text-2xl">aidorama</h1>
				</div>
				<ModeToggle />
			</div>

			{/* Main content */}
			<div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
				<div className="w-full max-w-md">
					<Card className="border-border/50 shadow-lg">
						<CardHeader className="text-center">
							<CardTitle className="text-xl lg:text-2xl">
								{isSignUp ? "Buat Akun" : "Masuk"}
							</CardTitle>
							<CardDescription className="text-sm lg:text-base">
								{isSignUp
									? "Daftar untuk mulai berinteraksi dengan karakter AI"
									: "Masuk ke akun Anda untuk melanjutkan"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isSignUp ? (
								<SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
							) : (
								<SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
							)}

							<div className="mt-6 text-center">
								<p className="text-muted-foreground text-sm">
									{isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}
								</p>
								<Button
									variant="link"
									className="h-auto p-0 font-normal"
									onClick={() => setIsSignUp(!isSignUp)}
								>
									{isSignUp ? "Masuk di sini" : "Daftar di sini"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
