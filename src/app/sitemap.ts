import { MetadataRoute } from 'next'
import {
	getProperties,
	getStates,
	getCitiesByState,
} from '@/services/propertyService'
import { Property } from '@/types/property'

const SITE_URL = 'https://chancerealty.am'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Static pages with high priority
	const staticPages = [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 1.0,
		},
		{
			url: `${SITE_URL}/properties`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/about`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/contact`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		},
	]

	// Property type pages
	const propertyTypePages = ['house', 'apartment', 'commercial', 'land'].map(
		type => ({
			url: `${SITE_URL}/properties?property_type=${type}`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.8,
		})
	)

	// Listing type pages
	const listingTypePages = ['sale', 'rent', 'daily_rent'].map(type => ({
		url: `${SITE_URL}/properties?listing_type=${type}`,
		lastModified: new Date(),
		changeFrequency: 'daily' as const,
		priority: 0.8,
	}))

	try {
		// Get all properties for individual property pages
		const properties = await getProperties({ limit: 1000 })
		const propertyPages = properties.map((property: Property) => ({
			url: `${SITE_URL}/properties/${property.custom_id}`,
			lastModified: new Date(property.updated_at),
			changeFrequency: 'weekly' as const,
		}))

		// Get location-based pages
		const states = await getStates()
		const locationPages = []

		for (const state of states) {
			// State-level pages
			locationPages.push({
				url: `${SITE_URL}/properties?state_id=${state.id}`,
				lastModified: new Date(),
				changeFrequency: 'daily' as const,
				priority: 0.7,
			})

			try {
				// City-level pages
				const cities = await getCitiesByState(state.id)
				for (const city of cities) {
					locationPages.push({
						url: `${SITE_URL}/properties?city_id=${city.id}`,
						lastModified: new Date(),
						changeFrequency: 'daily' as const,
						priority: 0.6,
					})
				}
			} catch (error) {
				console.error(`Error fetching cities for state ${state.id}:`, error)
			}
		}

		return [
			...staticPages,
			...propertyTypePages,
			...listingTypePages,
			...propertyPages,
			...locationPages,
		]
	} catch (error) {
		console.error('Error generating sitemap:', error)
		// Return at least static pages if dynamic content fails
		return [...staticPages, ...propertyTypePages, ...listingTypePages]
	}
}
