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
	title: "AiDorama",
	description: "Roleplay AI Indonesia",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
		other: [
			{
				rel: "android-chrome-192x192",
				url: "/android-chrome-192x192.png",
			},
			{
				rel: "android-chrome-512x512",
				url: "/android-chrome-512x512.png",
			},
		],
	},
	manifest: "/site.webmanifest",
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
