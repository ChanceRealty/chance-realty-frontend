// src/app/[locale]/properties/page.tsx - Optimized
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import PropertiesContent from './PropertiesContent'
import { generateLocationMetadata } from '@/utils/seo'
import { generateBreadcrumbSchema } from '@/utils/structuredData'

interface PropertiesPageProps {
	params: Promise<{ locale: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
	params,
	searchParams,
}: PropertiesPageProps): Promise<Metadata> {
	const { locale } = await params
	const searchParamsData = await searchParams

	const propertyType = searchParamsData.property_type as string
	const listingType = searchParamsData.listing_type as string
	const stateId = searchParamsData.state_id as string
	const cityId = searchParamsData.city_id as string

	const { title, description, keywords } = generateLocationMetadata({
		type: propertyType,
	})

	let canonicalUrl = `https://chancerealty.am/${locale}/properties`
	const urlParams = new URLSearchParams()
	if (propertyType) urlParams.append('property_type', propertyType)
	if (listingType) urlParams.append('listing_type', listingType)
	if (stateId) urlParams.append('state_id', stateId)
	if (cityId) urlParams.append('city_id', cityId)

	if (urlParams.toString()) {
		canonicalUrl += `?${urlParams.toString()}`
	}

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			images: ['/images/og-properties.jpg'],
			url: canonicalUrl,
			type: 'website',
			locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: ['/images/og-properties.jpg'],
		},
		alternates: {
			canonical: canonicalUrl,
			languages: {
				'hy-AM': `https://chancerealty.am/hy/properties`,
				'en-US': `https://chancerealty.am/en/properties`,
				'ru-RU': `https://chancerealty.am/ru/properties`,
			},
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
	}
}

function LoadingFallback() {
	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
			<div className='text-center'>
				<div className='relative mb-4'>
					<Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto' />
					<div className='absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse mx-auto'></div>
				</div>
				<p className='text-gray-600 font-medium'>Loading properties...</p>
				<p className='text-gray-400 text-sm mt-2'>
					Please wait while we fetch the latest listings
				</p>
			</div>
		</div>
	)
}

export default async function PropertiesPage({ params }: PropertiesPageProps) {
	const { locale } = await params

	const breadcrumbSchema = generateBreadcrumbSchema([
		{ name: 'Home', url: `https://chancerealty.am/${locale}` },
		{ name: 'Properties', url: `https://chancerealty.am/${locale}/properties` },
	])

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'RealEstateAgent',
		name: 'Chance Realty',
		url: `https://chancerealty.am/${locale}/properties`,
		description:
			'Premium real estate properties in Armenia. Houses, apartments, commercial properties, and land for sale and rent.',
		areaServed: {
			'@type': 'Country',
			name: 'Armenia',
		},
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Real Estate Properties',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Residential Properties',
						category: 'Real Estate',
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Commercial Properties',
						category: 'Real Estate',
					},
				},
			],
		},
	}

	return (
		<>
			{/* Enhanced Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>

			{/* Performance optimized loading */}
			<Suspense fallback={<LoadingFallback />}>
				<PropertiesContent />
			</Suspense>
		</>
	)
}
