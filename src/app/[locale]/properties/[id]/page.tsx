// src/app/[locale]/properties/[id]/page.tsx - Fixed
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPropertyByCustomId } from '@/services/propertyService'
import { generatePropertySchema } from '@/utils/structuredData'
import { generatePropertyMetadata } from '@/utils/seo'
import PropertyDetailClient from './PropertyDetailClient'

interface PropertyPageProps {
	params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({
	params,
}: PropertyPageProps): Promise<Metadata> {
	try {
		// ✅ FIX: Properly await params
		const { id, locale } = await params
		const property = await getPropertyByCustomId(id)

		if (!property) {
			return {
				title: 'Property Not Found | Chance Realty',
				description: 'The requested property could not be found.',
				robots: { index: false, follow: false },
			}
		}

		const { title, description, keywords, image } =
			generatePropertyMetadata(property)

		const filteredKeywords = Array.isArray(keywords)
			? keywords.filter((kw): kw is string => typeof kw === 'string')
			: keywords

		return {
			title,
			description,
			keywords: filteredKeywords,
			openGraph: {
				title,
				description,
				images: [image],
				url: `https://chancerealty.am/${locale}/properties/${property.custom_id}`,
				type: 'article',
			},
			twitter: {
				card: 'summary_large_image',
				title,
				description,
				images: [image],
			},
			alternates: {
				canonical: `https://chancerealty.am/${locale}/properties/${property.custom_id}`,
			},
		}
	} catch (error) {
		console.error('Error generating property metadata:', error)
		return {
			title: 'Property | Chance Realty',
			description: 'View property details on Chance Realty.',
		}
	}
}

export default async function PropertyPage({ params }: PropertyPageProps) {
	let property

	try {
		// ✅ FIX: Properly await params
		const { id } = await params
		property = await getPropertyByCustomId(id)
	} catch (error) {
		console.error('Error fetching property:', error)
		notFound()
	}

	if (!property) {
		notFound()
	}

	const { locale } = await params
	const propertySchema = generatePropertySchema(property)
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: `https://chancerealty.am/${locale}`,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Properties',
				item: `https://chancerealty.am/${locale}/properties`,
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: property.title,
				item: `https://chancerealty.am/${locale}/properties/${property.custom_id}`,
			},
		],
	}

	return (
		<>
			{/* Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(propertySchema),
				}}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>

			<PropertyDetailClient property={property} />
		</>
	)
}
