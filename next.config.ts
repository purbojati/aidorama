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
		],
	},
};

export default nextConfig;
