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
	title: {
		hy: 'Chance Realty - Գտեք ձեր իդեալական գույքը Հայաստանում',
		en: 'Chance Realty - Find Your Dream Property in Armenia',
		ru: 'Chance Realty - Найдите свою недвижимость в Армении',
	},
	description: {
		hy: 'Բացահայտեք պրեմիում անշարժ գույք Հայաստանում. Տներ, բնակարաններ, առևտրային տարածքներ և հողատարածքներ վաճառքի կամ վարձակալության համար։',
		en: 'Discover premium real estate in Armenia. Houses, apartments, commercial properties, and land for sale or rent.',
		ru: 'Откройте премиальную недвижимость в Армении. Дома, квартиры, коммерческая недвижимость и участки на продажу или аренду.',
	},
	keywords: {
		hy: [
			'անշարժ գույք Հայաստան',
			'տուն վաճառք Երևան',
			'բնակարան վարձակալություն',
			'առևտրային տարածք Հայաստան',
			'հող վաճառք',
			'Chance Realty',
		],
		en: [
			'real estate Armenia',
			'property Armenia',
			'houses for sale Yerevan',
			'apartments for rent Armenia',
			'commercial property Armenia',
			'land for sale Armenia',
			'Chance Realty',
		],
		ru: [
			'недвижимость Армения',
			'дома на продажу Ереван',
			'квартиры в аренду',
			'коммерческая недвижимость Армения',
			'земля на продажу',
			'Chance Realty',
		],
	},
	image: '/images/og-image.png', // оптимизированное OG изображение
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

	// Определяем язык по пути
	const lang = pathname.startsWith('/hy')
		? 'hy'
		: pathname.startsWith('/ru')
		? 'ru'
		: 'en'

	const seoTitle = title || DEFAULT_SEO.title[lang]
	const seoDescription = description || DEFAULT_SEO.description[lang]
	const seoKeywords = [...DEFAULT_SEO.keywords[lang], ...keywords]
	const seoImage = image || DEFAULT_SEO.image
	const seoUrl = url || `${DEFAULT_SEO.url}${pathname}`
	const seoCanonical = canonical || `${DEFAULT_SEO.url}${pathname}`

	const robotsContent = [
		noindex ? 'noindex' : 'index',
		nofollow ? 'nofollow' : 'follow',
	].join(', ')

	return (
		<Head>
			{/* Basic Meta Tags */}
			<title>{seoTitle}</title>
			<meta name='description' content={seoDescription} />
			<meta name='keywords' content={seoKeywords.join(', ')} />
			<meta name='robots' content={robotsContent} />
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<meta name='theme-color' content='#2563eb' />

			{/* Canonical URL */}
			<link rel='canonical' href={seoCanonical} />

			{/* Open Graph */}
			<meta property='og:type' content={type} />
			<meta property='og:title' content={seoTitle} />
			<meta property='og:description' content={seoDescription} />
			<meta property='og:image' content={seoImage} />
			<meta property='og:image:width' content='1200' />
			<meta property='og:image:height' content='630' />
			<meta property='og:url' content={seoUrl} />
			<meta property='og:site_name' content='Chance Realty' />
			<meta
				property='og:locale'
				content={lang === 'hy' ? 'hy_AM' : lang === 'ru' ? 'ru_RU' : 'en_US'}
			/>

			{/* Twitter Card */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={seoTitle} />
			<meta name='twitter:description' content={seoDescription} />
			<meta name='twitter:image' content={seoImage} />
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
					dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
				href={`https://chancerealty.am/en${pathname}`}
			/>
			<link
				rel='alternate'
				hrefLang='hy'
				href={`https://chancerealty.am${pathname}`}
			/>
			<link
				rel='alternate'
				hrefLang='ru'
				href={`https://chancerealty.am/ru${pathname}`}
			/>
			<link
				rel='alternate'
				hrefLang='x-default'
				href={`https://chancerealty.am${pathname}`}
			/>
		</Head>
	)
}
