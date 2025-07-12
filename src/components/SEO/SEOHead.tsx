'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
	title?: string
	description?: string
	keywords?: string[]
	image?: string
	url?: string
	type?: 'website' | 'article' | 'product'
	publishedTime?: string
	modifiedTime?: string
	author?: string
	canonical?: string
	noindex?: boolean
	nofollow?: boolean
	structuredData?: object
}

const DEFAULT_SEO = {
	title: 'Chance Realty - Find Your Dream Property in Armenia',
	description:
		'Discover premium real estate in Armenia. Houses, apartments, commercial properties, and land for sale or rent. Professional real estate services in Yerevan and surrounding areas.',
	keywords: [
		'real estate Armenia',
		'property Armenia',
		'houses for sale Yerevan',
		'apartments for rent Armenia',
		'commercial property Armenia',
		'land for sale Armenia',
		'Chance Realty',
		'Armenian real estate',
		'Yerevan property market',
	],
	image: '/images/og-image.jpg',
	type: 'website' as const,
	url: 'https://chancerealty.am',
}

export default function SEOHead({
	title,
	description,
	keywords = [],
	image,
	url,
	type = 'website',
	publishedTime,
	modifiedTime,
	author,
	canonical,
	noindex = false,
	nofollow = false,
	structuredData,
}: SEOProps) {
	const pathname = usePathname()

	const seo = {
		title: title ? `${title} | Chance Realty` : DEFAULT_SEO.title,
		description: description || DEFAULT_SEO.description,
		keywords: [...DEFAULT_SEO.keywords, ...keywords],
		image: image || DEFAULT_SEO.image,
		url: url || `${DEFAULT_SEO.url}${pathname}`,
		type,
		canonical: canonical || `${DEFAULT_SEO.url}${pathname}`,
	}

	const robotsContent = [
		noindex ? 'noindex' : 'index',
		nofollow ? 'nofollow' : 'follow',
	].join(', ')

	return (
		<Head>
			{/* Basic Meta Tags */}
			<title>{seo.title}</title>
			<meta name='description' content={seo.description} />
			<meta name='keywords' content={seo.keywords.join(', ')} />
			<meta name='robots' content={robotsContent} />
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<meta name='theme-color' content='#2563eb' />

			{/* Canonical URL */}
			<link rel='canonical' href={seo.canonical} />

			{/* Open Graph */}
			<meta property='og:type' content={seo.type} />
			<meta property='og:title' content={seo.title} />
			<meta property='og:description' content={seo.description} />
			<meta property='og:image' content={seo.image} />
			<meta property='og:url' content={seo.url} />
			<meta property='og:site_name' content='Chance Realty' />
			<meta property='og:locale' content='en_US' />
			<meta property='og:locale:alternate' content='hy_AM' />

			{/* Twitter Card */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={seo.title} />
			<meta name='twitter:description' content={seo.description} />
			<meta name='twitter:image' content={seo.image} />
			<meta name='twitter:site' content='@ChanceRealty' />

			{/* Additional Meta Tags */}
			{author && <meta name='author' content={author} />}
			{publishedTime && (
				<meta property='article:published_time' content={publishedTime} />
			)}
			{modifiedTime && (
				<meta property='article:modified_time' content={modifiedTime} />
			)}

			{/* Structured Data */}
			{structuredData && (
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
			)}

			{/* Favicon and Icons */}
			<link rel='icon' href='/favicon.ico' />
			<link
				rel='icon'
				type='image/png'
				sizes='32x32'
				href='/favicon-32x32.png'
			/>
			<link
				rel='icon'
				type='image/png'
				sizes='16x16'
				href='/favicon-16x16.png'
			/>
			<link
				rel='apple-touch-icon'
				sizes='180x180'
				href='/apple-touch-icon.png'
			/>
			<link rel='manifest' href='/site.webmanifest' />

			{/* Preconnect to external domains */}
			<link rel='preconnect' href='https://fonts.googleapis.com' />
			<link
				rel='preconnect'
				href='https://fonts.gstatic.com'
				crossOrigin='anonymous'
			/>

			{/* Language alternates */}
			<link
				rel='alternate'
				hrefLang='en'
				href={`https://chancerealty.am${pathname}`}
			/>
			<link
				rel='alternate'
				hrefLang='hy'
				href={`https://chancerealty.am/hy${pathname}`}
			/>
			<link
				rel='alternate'
				hrefLang='x-default'
				href={`https://chancerealty.am${pathname}`}
			/>
		</Head>
	)
}
