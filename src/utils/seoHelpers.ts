import { Property } from '@/types/property'

export const generateCanonicalUrl = (
	path: string,
	params?: Record<string, string>
) => {
	const baseUrl = 'https://chancerealty.am'
	let url = `${baseUrl}${path}`

	if (params && Object.keys(params).length > 0) {
		const searchParams = new URLSearchParams()
		Object.entries(params).forEach(([key, value]) => {
			if (value) searchParams.append(key, value)
		})
		const paramString = searchParams.toString()
		if (paramString) url += `?${paramString}`
	}

	return url
}

export const generateMetaKeywords = (property: Property): string[] => {
	const keywords = [
		property.property_type,
		property.listing_type,
		'real estate',
		'property',
		'Armenia',
		property.city?.name,
		property.state?.name,
		'Chance Realty',
	]

	if ('attributes' in property) {
		if (
			property.property_type === 'house' ||
			property.property_type === 'apartment'
		) {
			keywords.push(
				`${property.attributes.bedrooms} bedroom`,
				`${property.attributes.bathrooms} bathroom`
			)
		}

		if (
			property.property_type === 'house' ||
			property.property_type === 'apartment' ||
			property.property_type === 'commercial'
		) {
			if ('area_sqft' in property.attributes && property.attributes.area_sqft) {
				keywords.push(`${property.attributes.area_sqft} sqft`)
			}
		}

		if (
			property.property_type === 'land' &&
			'area_acres' in property.attributes &&
			property.attributes.area_acres
		) {
			keywords.push(`${property.attributes.area_acres} acres`)
		}
	}

	switch (property.listing_type) {
		case 'sale':
			keywords.push('for sale', 'buy', 'purchase')
			break
		case 'rent':
			keywords.push('for rent', 'rental', 'lease')
			break
		case 'daily_rent':
			keywords.push('daily rental', 'short term', 'vacation rental')
			break
	}

	return keywords.filter(Boolean)
}

export const generateImageAlt = (
	property: Property,
	imageIndex: number = 0
): string => {
	const propertyType =
		property.property_type.charAt(0).toUpperCase() +
		property.property_type.slice(1)
	const location = `${property.city?.name ?? ''}, ${property.state?.name ?? ''}`

	let alt = `${propertyType} for ${property.listing_type} in ${location}`

	if (
		'attributes' in property &&
		(property.property_type === 'house' ||
			property.property_type === 'apartment')
	) {
		alt += ` - ${property.attributes.bedrooms} bed, ${property.attributes.bathrooms} bath`
	}

	if (imageIndex > 0) {
		alt += ` - Image ${imageIndex + 1}`
	}

	return alt
}

export const formatPriceForSEO = (
	price: number,
	currency: string,
	listingType: string
): string => {
	const formatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency || 'USD',
		maximumFractionDigits: 0,
	}).format(price)

	switch (listingType) {
		case 'rent':
			return `${formatted} per month`
		case 'daily_rent':
			return `${formatted} per day`
		default:
			return formatted
	}
}
