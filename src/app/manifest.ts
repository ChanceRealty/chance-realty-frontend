import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Chance Realty - Armenia Real Estate',
		short_name: 'Chance Realty',
		description:
			'Find your dream property in Armenia. Houses, apartments, commercial properties, and land for sale or rent.',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#2563eb',
		orientation: 'portrait',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
			{
				src: '/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
		categories: ['business', 'finance'],
		screenshots: [
			{
				src: '/screenshots/desktop.png',
				sizes: '1280x720',
				type: 'image/png',
				form_factor: 'wide',
			},
			{
				src: '/screenshots/mobile.png',
				sizes: '390x844',
				type: 'image/png',
				form_factor: 'narrow',
			},
		],
	}
}
