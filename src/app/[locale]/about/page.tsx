// src/app/[locale]/about/page.tsx - Fixed
import { Metadata } from 'next'
import AboutClient from './AboutClient'
import { generateLocalBusinessSchema } from '@/utils/structuredData'

interface AboutPageProps {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({
	params,
}: AboutPageProps): Promise<Metadata> {
	// ✅ FIX: Properly await params
	const { locale } = await params

	const translations = {
		hy: {
			title:
				'Մեր մասին - Chance Realty | 15+ տարվա անշարժ գույքի գծով գերազանցություն',
			description:
				'Ծանոթացեք Chance Realty-ի հետ, Հայաստանի առաջատար անշարժ գույքի գործակալությանը։',
		},
		en: {
			title: 'About Us - Chance Realty | 15+ Years of Real Estate Excellence',
			description:
				"Learn about Chance Realty, Armenia's leading real estate agency.",
		},
		ru: {
			title:
				'О нас - Chance Realty | 15+ лет превосходства в сфере недвижимости',
			description:
				'Узнайте больше о Chance Realty, ведущем агентстве недвижимости Армении.',
		},
	}

	const meta =
		translations[locale as keyof typeof translations] || translations.en

	return {
		title: meta.title,
		description: meta.description,
		keywords: [
			'about Chance Realty',
			'real estate agency Armenia',
			'Yerevan real estate experts',
			'Armenian property specialists',
		],
		openGraph: {
			title: meta.title,
			description: meta.description,
			images: ['/images/og-about.jpg'],
			url: `https://chancerealty.am/${locale}/about`,
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}/about`,
		},
	}
}

export default async function AboutPage({ params }: AboutPageProps) {
	const { locale } = await params

	const localBusinessSchema = generateLocalBusinessSchema()
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
				name: 'About Us',
				item: `https://chancerealty.am/${locale}/about`,
			},
		],
	}

	return (
		<>
			{/* Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(localBusinessSchema),
				}}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>

			<AboutClient />
		</>
	)
}
