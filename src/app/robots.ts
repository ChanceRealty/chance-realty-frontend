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
					'/*?utm_',
					'/*?fbclid',
					'/*?gclid',
				],
			},
		],
		sitemap: 'https://chancerealty.am/sitemap.xml',
		host: 'https://chancerealty.am',
	}
}
