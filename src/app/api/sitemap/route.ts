import { NextResponse } from 'next/server'
import {
	getProperties,
	getStates,
	getCitiesByState,
} from '@/services/propertyService'

interface PropertyImage {
	url: string
	title?: string
	caption?: string
}

interface Property {
	custom_id: string
	updated_at: string | Date
	featured?: boolean
	title: string
	images?: PropertyImage[]
}

const SITE_URL = 'https://chancerealty.am'

const LANGS = [
	{ prefix: '', locale: 'en_US' },
	{ prefix: '/hy', locale: 'hy_AM' },
	{ prefix: '/ru', locale: 'ru_RU' },
]

export async function GET() {
	try {
		const properties: Property[] = await getProperties({ limit: 1000 })
		const states = await getStates()

		const staticPages = [
			{ path: '/', priority: 1.0, changefreq: 'daily' },
			{ path: '/about', priority: 0.8, changefreq: 'monthly' },
			{ path: '/contact', priority: 0.8, changefreq: 'monthly' },
			{ path: '/properties', priority: 0.9, changefreq: 'daily' },
		]

		const propertyTypePages = ['house', 'apartment', 'commercial', 'land'].map(
			type => ({
				path: `/properties?property_type=${type}`,
				priority: 0.7,
				changefreq: 'daily',
			})
		)
		const listingTypePages = ['sale', 'rent', 'daily_rent'].map(type => ({
			path: `/properties?listing_type=${type}`,
			priority: 0.7,
			changefreq: 'daily',
		}))

		const locationPages: {
			path: string
			priority: number
			changefreq: string
		}[] = []
		for (const state of states) {
			locationPages.push({
				path: `/properties?state_id=${state.id}`,
				priority: 0.7,
				changefreq: 'daily',
			})
			try {
				const cities = await getCitiesByState(state.id)
				for (const city of cities) {
					locationPages.push({
						path: `/properties?city_id=${city.id}`,
						priority: 0.6,
						changefreq: 'daily',
					})
				}
			} catch (error) {
				console.error(`Error fetching cities for state ${state.id}:`, error)
			}
		}

		const urlsXml = LANGS.map(lang => {
			const allPages = [
				...staticPages,
				...propertyTypePages,
				...listingTypePages,
				...locationPages,
			]

			const staticXml = allPages
				.map(
					page => `
  <url>
    <loc>${SITE_URL}${lang.prefix}${page.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
				)
				.join('')

			const propertiesXml = properties
				.map(prop => {
					const imagesXml =
						prop.images
							?.map(
								img => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${prop.title}</image:title>
      <image:caption>${img.caption || prop.title}</image:caption>
    </image:image>`
							)
							.join('') || ''

					return `
  <url>
    <loc>${SITE_URL}${lang.prefix}/properties/${prop.custom_id}</loc>
    <lastmod>${new Date(prop.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${prop.featured ? 0.9 : 0.6}</priority>
    ${imagesXml}
  </url>`
				})
				.join('')

			return staticXml + propertiesXml
		}).join('')

		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`

		return new NextResponse(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600, s-maxage=3600',
			},
		})
	} catch (error) {
		console.error('Error generating sitemap:', error)
		return new NextResponse('Error generating sitemap', { status: 500 })
	}
}
