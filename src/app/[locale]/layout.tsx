// src/app/[locale]/layout.tsx - Complete file with dynamic multilingual titles
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const locales = ['hy', 'en', 'ru'] as const
type Locale = (typeof locales)[number]

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params

	if (!locales.includes(locale as Locale)) {
		return {
			title: 'Page Not Found',
			description: 'The requested page could not be found.',
		}
	}

	const translations = {
		hy: {
			title: 'Chance Realty - Գտեք ձեր երազանքի անշարժ գույքը Հայաստանում',
			description:
				'Բացահայտեք պրեմիում անշարժ գույք Հայաստանում։ Տներ, բնակարաններ, կոմերցիոն գույք և հողատարածքներ վաճառքի և վարձակալության համար։',
			keywords: [
				'անշարժ գույք Հայաստան',
				'տներ վաճառք Երևան',
				'բնակարաններ վարձակալություն Հայաստան',
				'կոմերցիոն գույք Հայաստան',
				'հող վաճառք Հայաստան',
				'Chance Realty',
			],
		},
		en: {
			title: 'Chance Realty - Find Your Dream Property in Armenia',
			description:
				'Discover premium real estate in Armenia. Houses, apartments, commercial properties, and land for sale or rent.',
			keywords: [
				'real estate Armenia',
				'houses for sale Yerevan',
				'apartments for rent Armenia',
				'commercial property Armenia',
				'land for sale Armenia',
				'Chance Realty',
			],
		},
		ru: {
			title: 'Chance Realty - Найдите недвижимость вашей мечты в Армении',
			description:
				'Откройте для себя премиальную недвижимость в Армении. Дома, квартиры, коммерческая недвижимость и земля на продажу или аренду.',
			keywords: [
				'недвижимость Армения',
				'дома на продажу Ереван',
				'квартиры в аренду Армения',
				'коммерческая недвижимость Армения',
				'земля на продажу Армения',
				'Chance Realty',
			],
		},
	}

	const meta = translations[locale as Locale]

	return {
		title: meta.title,
		description: meta.description,
		keywords: meta.keywords,
		openGraph: {
			title: meta.title,
			description: meta.description,
			locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
			url: `https://chancerealty.am/${locale}`,
			images: ['/images/og-home.jpg'],
			siteName: 'Chance Realty',
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: meta.title,
			description: meta.description,
			images: ['/images/og-home.jpg'],
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}`,
			languages: {
				'hy-AM': 'https://chancerealty.am/hy',
				'en-US': 'https://chancerealty.am/en',
				'ru-RU': 'https://chancerealty.am/ru',
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

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params

	// Validate locale
	if (!locales.includes(locale as Locale)) {
		notFound()
	}

	// Return only children, no HTML structure
	// The HTML structure should only be in the root layout
	return <>{children}</>
}

// Generate static params for all locales
export function generateStaticParams() {
	return locales.map(locale => ({ locale }))
}
