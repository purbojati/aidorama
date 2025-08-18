import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import { ClientLayout } from "@/components/client-layout";
import { ThemeColor } from "@/components/theme-color";

const jakartaSans = Plus_Jakarta_Sans({
	variable: "--font-sans",
	subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL('https://aidorama.app'),
	title: {
		default: "AiDorama - Roleplay AI Indonesia",
		template: "%s | AiDorama"
	},
	description: "Ngobrol dengan karakter imajiner yang seru. Buat roleplaymu lebih seru dengan AI. Platform roleplay AI terbaik di Indonesia untuk berinteraksi dengan karakter virtual.",
	keywords: [
		"AI roleplay",
		"karakter AI",
		"roleplay Indonesia", 
		"chat AI",
		"karakter imajiner",
		"AI Indonesia",
		"virtual character",
		"AI companion",
		"Indonesian AI",
		"chatbot Indonesia"
	],
	authors: [{ name: "AiDorama Team" }],
	creator: "AiDorama",
	publisher: "AiDorama",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'id_ID',
		url: 'https://aidorama.app',
		siteName: 'AiDorama',
		title: 'AiDorama - Roleplay AI Indonesia',
		description: 'Ngobrol dengan karakter imajiner yang seru. Buat roleplaymu lebih seru dengan AI. Platform roleplay AI terbaik di Indonesia.',
		images: [
			{
				url: '/aidorama-logo-trans.png',
				width: 1200,
				height: 630,
				alt: 'AiDorama - Roleplay AI Indonesia',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@aidorama',
		creator: '@aidorama',
		title: 'AiDorama - Roleplay AI Indonesia',
		description: 'Ngobrol dengan karakter imajiner yang seru. Buat roleplaymu lebih seru dengan AI.',
		images: ['/aidorama-logo-trans.png'],
	},
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
	alternates: {
		canonical: 'https://aidorama.app',
	},
	category: 'Technology',
};

// Structured Data Schema
const structuredData = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	"name": "AiDorama",
	"description": "Platform roleplay AI terbaik di Indonesia untuk berinteraksi dengan karakter imajiner yang seru",
	"url": "https://aidorama.app",
	"applicationCategory": "Entertainment",
	"operatingSystem": "Web Browser",
	"offers": {
		"@type": "Offer",
		"price": "0",
		"priceCurrency": "IDR"
	},
	"creator": {
		"@type": "Organization",
		"name": "AiDorama Team"
	},
	"inLanguage": "id-ID",
	"audience": {
		"@type": "Audience",
		"geographicArea": {
			"@type": "Country",
			"name": "Indonesia"
		}
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#000000" />
				<link rel="canonical" href="https://aidorama.app" />
			</head>
			<body
				className={`${jakartaSans.variable} ${jetBrainsMono.variable} antialiased`}
			>
				<Providers>
					<ThemeColor />
					<ClientLayout>{children}</ClientLayout>
				</Providers>
			</body>
		</html>
	);
}
