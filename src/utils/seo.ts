import { Property } from '@/types/property'

export const generatePropertyMetadata = (property: Property) => {
	const price = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: property.currency || 'USD',
		maximumFractionDigits: 0,
	}).format(property.price)

	const propertyType =
		property.property_type.charAt(0).toUpperCase() +
		property.property_type.slice(1)

	let title = `${propertyType} for ${
		property.listing_type === 'sale' ? 'Sale' : 'Rent'
	}`

	if ('attributes' in property) {
		if (
			property.property_type === 'house' ||
			property.property_type === 'apartment'
		) {
			// Эти типы точно имеют bedrooms и bathrooms
			title += ` - ${property.attributes.bedrooms} Bed, ${property.attributes.bathrooms} Bath`
			if ('area_sqft' in property.attributes) {
				title += ` - ${property.attributes.area_sqft.toLocaleString()} sq ft`
			}
		} else if (property.property_type === 'commercial') {
			// У commercial нет bedrooms/bathrooms, но есть area_sqft
			if ('area_sqft' in property.attributes) {
				title += ` - ${property.attributes.area_sqft.toLocaleString()} sq ft`
			}
		} else if (property.property_type === 'land') {
			if ('area_acres' in property.attributes) {
				title += ` - ${property.attributes.area_acres.toLocaleString()} acres`
			}
		}
	}
	  
	  

	title += ` in ${property.city?.name}, Armenia - ${price}`

	const description =
		property.description ||
		`${propertyType} for ${property.listing_type} in ${property.city?.name}, ${
			property.state?.name
		}. ${
			'attributes' in property &&
			(property.property_type === 'house' ||
				property.property_type === 'apartment')
				? `${property.attributes.bedrooms} bedrooms, ${property.attributes.bathrooms} bathrooms.`
				: ''
		} Price: ${price}. Contact Chance Realty for more details.`


	const keywords = [
		property.property_type,
		property.listing_type,
		property.city?.name,
		property.state?.name,
		'Armenia',
		'real estate',
		'property',
		'Chance Realty',
	].filter(Boolean)

	return {
		title,
		description,
		keywords,
		image: property.images?.[0]?.url || '/images/default-property.jpg',
	}
}

export const generateLocationMetadata = (location: {
	city?: string
	state?: string
	type?: string
}) => {
	const { city, state, type } = location

	let title = 'Real Estate'
	let description = 'Discover premium real estate properties'

	if (type) {
		title = `${type.charAt(0).toUpperCase() + type.slice(1)} Properties`
		description = `Find ${type} properties`
	}

	if (city && state) {
		title += ` in ${city}, ${state}`
		description += ` in ${city}, ${state}`
	} else if (state) {
		title += ` in ${state}`
		description += ` in ${state}`
	}

	title += ' | Chance Realty'
	description +=
		'. Professional real estate services with verified listings and expert guidance.'

	const keywords = [
		'real estate',
		'property',
		type,
		city,
		state,
		'Armenia',
		'houses',
		'apartments',
		'commercial',
		'land',
		'Chance Realty',
	].filter(Boolean)

	return {
		title,
		description,
		keywords: keywords.join(', '),
	}
}
