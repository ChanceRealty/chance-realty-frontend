import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		// Enable type checking during build
		ignoreBuildErrors: true,
	},
	images: {
		formats: ['image/webp', 'image/avif'],
		domains: [
			'ik.imagekit.io',
			'realty-app-admin.vercel.app',
			'localhost::3000',
			'localhost',
			'flagcdn.com',
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	async headers() {
		return [
		  {
			source: '/(.*)',
			headers: [
			  {
				key: 'X-Content-Type-Options',
				value: 'nosniff',
			  },
			  {
				key: 'X-Frame-Options',
				value: 'DENY',
			  },
			  {
				key: 'X-XSS-Protection',
				value: '1; mode=block',
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
				key: 'Content-Type',
				value: 'application/xml',
			  },
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
				key: 'Content-Type',
				value: 'text/plain',
			  },
			  {
				key: 'Cache-Control',
				value: 'public, max-age=86400, s-maxage=86400',
			  },
			],
		  },
		]
	  },
	
	  // Redirects for SEO
	  async redirects() {
		return [
		  {
			source: '/property/:path*',
			destination: '/properties/:path*',
			permanent: true,
		  },
		  {
			source: '/home',
			destination: '/',
			permanent: true,
		  },
		  {
			source: '/index',
			destination: '/',
			permanent: true,
		  },
		]
	  },
	
	  // Compression
	  compress: true,
	
	  // Generate build-time static exports
	  output: 'standalone',
	
	  // Enable trailing slash for consistency
	  trailingSlash: false,
	
	  // PoweredBy header removal
	  poweredByHeader: false,
	}
	

export default nextConfig;
