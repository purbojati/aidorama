import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'pub-01f2bdef8ccc41dc8000f357c0d4ed85.r2.dev',
				port: '',
				pathname: '/**',
			},
			{
				protocol: "https",
				hostname: "s3.aidorama.app",
				port: "",
				pathname: "/**",
			},
		],
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	async redirects() {
		return [
			// Redirect old character routes to new ones if needed
			{
				source: '/character/:id',
				destination: '/characters/:id',
				permanent: true,
			},
		];
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
			{
				source: '/sitemap.xml',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, s-maxage=86400',
					},
				],
			},
			{
				source: '/robots.txt',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, s-maxage=86400',
					},
				],
			},
		];
	},

	// Enable experimental features for performance
	experimental: {
		optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
	},
};

export default nextConfig;
