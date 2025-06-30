import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const outfit = Outfit({
	variable: "--font-sans",
	subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "aidorama",
	description: "aidorama",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body
				className={`${outfit.variable} ${jetBrainsMono.variable} antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
