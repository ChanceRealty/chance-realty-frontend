// src/utils/performanceOptimizations.ts - Performance optimizations
export const optimizationConfig = {
	// Image optimization
	imageFormats: ['webp', 'avif'],
	imageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

	// Lazy loading
	lazyLoadOffset: '200px',

	// Cache settings
	staticCacheMaxAge: 31536000, // 1 year
	dynamicCacheMaxAge: 3600, // 1 hour

	// Bundle optimization
	splitChunks: {
		chunks: 'all',
		cacheGroups: {
			vendor: {
				test: /[\\/]node_modules[\\/]/,
				name: 'vendors',
				chunks: 'all',
			},
			translations: {
				test: /[\\/]translations[\\/]/,
				name: 'translations',
				chunks: 'all',
			},
		},
	},
}
