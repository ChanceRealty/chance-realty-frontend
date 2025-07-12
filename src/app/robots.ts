import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/admin/',
					'/api/',
					'/private/',
					'/temp/',
					'/*?*utm_*',
					'/*?*fbclid*',
					'/*?*gclid*',
				],
			},
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: ['/admin/', '/api/', '/private/', '/temp/'],
			},
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: ['/admin/', '/api/', '/private/', '/temp/'],
			},
		],
		sitemap: 'https://chancerealty.am/sitemap.xml',
		host: 'https://chancerealty.am',
	}
}
