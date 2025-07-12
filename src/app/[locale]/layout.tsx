// src/app/[locale]/layout.tsx - Fixed: Remove HTML structure
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
		},
		en: {
			title: 'Chance Realty - Find Your Dream Property in Armenia',
			description:
				'Discover premium real estate in Armenia. Houses, apartments, commercial properties, and land for sale or rent.',
		},
		ru: {
			title: 'Chance Realty - Найдите недвижимость вашей мечты в Армении',
			description:
				'Откройте для себя премиальную недвижимость в Армении. Дома, квартиры, коммерческая недвижимость и земля на продажу или аренду.',
		},
	}

	const meta = translations[locale as Locale]

	return {
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description,
			locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}`,
			languages: {
				'hy-AM': 'https://chancerealty.am/hy',
				'en-US': 'https://chancerealty.am/en',
				'ru-RU': 'https://chancerealty.am/ru',
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

	// ✅ FIX: Return only children, no HTML structure
	// The HTML structure should only be in the root layout
	return <>{children}</>
}

// Generate static params for all locales
export function generateStaticParams() {
	return locales.map(locale => ({ locale }))
}
