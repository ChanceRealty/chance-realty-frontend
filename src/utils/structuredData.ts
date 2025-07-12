import { Property } from '@/types/property'

export const generateOrganizationSchema = () => ({
	'@context': 'https://schema.org',
	'@type': 'RealEstateAgent',
	name: 'Chance Realty',
	url: 'https://chancerealty.am',
	logo: 'https://chancerealty.am/images/logo.png',
	image: 'https://chancerealty.am/images/og-image.jpg',
	description:
		'Premier real estate agency in Armenia offering houses, apartments, commercial properties, and land for sale and rent.',
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Central Business District',
		addressLocality: 'Yerevan',
		addressCountry: 'Armenia',
	},
	contactPoint: {
		'@type': 'ContactPoint',
		telephone: '+374-00-000-000',
		contactType: 'customer service',
		availableLanguage: ['English', 'Armenian'],
		areaServed: 'Armenia',
	},
	sameAs: [
		'https://facebook.com/ChanceRealty',
		'https://instagram.com/ChanceRealty',
		'https://linkedin.com/company/ChanceRealty',
	],
	hasOfferCatalog: {
		'@type': 'OfferCatalog',
		name: 'Real Estate Properties',
		itemListElement: [
			{
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Product',
					name: 'Residential Properties',
				},
			},
			{
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Product',
					name: 'Commercial Properties',
				},
			},
		],
	},
})

export const generatePropertySchema = (property: Property) => {
	const baseSchema = {
		'@context': 'https://schema.org',
		'@type': 'RealEstateProperty',
		name: property.title,
		description: property.description,
		url: `https://chancerealty.am/properties/${property.custom_id}`,
		image: property.images?.map(img => img.url) || [],
		address: {
			'@type': 'PostalAddress',
			streetAddress: property.address,
			addressLocality: property.city?.name,
			addressRegion: property.state?.name,
			addressCountry: 'Armenia',
			postalCode: property.postal_code,
		},
		geo:
			property.latitude && property.longitude
				? {
						'@type': 'GeoCoordinates',
						latitude: property.latitude,
						longitude: property.longitude,
				  }
				: undefined,
		offers: {
			'@type': 'Offer',
			price: property.price,
			priceCurrency: property.currency || 'USD',
			availability:
  property.status?.name === 'available'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock',

			priceSpecification: {
				'@type': 'PriceSpecification',
				price: property.price,
				priceCurrency: property.currency || 'USD',
				eligibleTransactionVolume: {
					'@type': 'PriceSpecification',
					name: property.listing_type === 'sale' ? 'Purchase' : 'Rental',
				},
			},
			seller: {
				'@type': 'RealEstateAgent',
				name: 'Chance Realty',
				url: 'https://chancerealty.am',
			},
		},
	}

	// Type-guarded floorSize per type
	let floorSize
	if (
		property.property_type === 'house' ||
		property.property_type === 'apartment'
	) {
		floorSize = {
			'@type': 'QuantitativeValue',
			value: property.attributes.area_sqft,
			unitCode: 'FTK',
		}
	} else if (property.property_type === 'commercial') {
		floorSize = {
			'@type': 'QuantitativeValue',
			value: property.attributes.area_sqft,
			unitCode: 'FTK',
		}
	} else if (property.property_type === 'land') {
		floorSize = {
			'@type': 'QuantitativeValue',
			value: property.attributes.area_acres,
			unitCode: 'ACR',
		}
	}

	const resultSchema: Record<string, unknown> = {
		...baseSchema,
		floorSize,
	}

	// Add property-type-specific schema extensions
	if (
		property.property_type === 'house' ||
		property.property_type === 'apartment'
	) {
		resultSchema['@type'] =
			property.property_type === 'house' ? 'House' : 'Apartment'
		resultSchema.numberOfRooms = property.attributes.bedrooms
		resultSchema.numberOfBathroomsTotal = property.attributes.bathrooms
	}

	return resultSchema
}

export const generateBreadcrumbSchema = (
	items: Array<{ name: string; url: string }>
) => ({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: items.map((item, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name: item.name,
		item: item.url,
	})),
})

export const generateWebsiteSchema = () => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'Chance Realty',
	url: 'https://chancerealty.am',
	potentialAction: {
		'@type': 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate:
				'https://chancerealty.am/properties?search={search_term_string}',
		},
		'query-input': 'required name=search_term_string',
	},
})

export const generateLocalBusinessSchema = () => ({
	'@context': 'https://schema.org',
	'@type': 'LocalBusiness',
	name: 'Chance Realty',
	image: 'https://chancerealty.am/images/office.jpg',
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Central Business District',
		addressLocality: 'Yerevan',
		addressCountry: 'Armenia',
	},
	geo: {
		'@type': 'GeoCoordinates',
		latitude: 40.1792,
		longitude: 44.4991,
	},
	telephone: '+374-00-000-000',
	email: 'info@chancerealty.am',
	url: 'https://chancerealty.am',
	openingHours: ['Mo-Fr 09:00-18:00'],
	priceRange: '$$',
	aggregateRating: {
		'@type': 'AggregateRating',
		ratingValue: '4.8',
		reviewCount: '127',
	},
})
