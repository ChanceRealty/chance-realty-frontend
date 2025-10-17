// src/app/[locale]/about/page.tsx - Updated with dynamic multilingual titles
import { Metadata } from 'next'
import AboutClient from './AboutClient'
import { generateLocalBusinessSchema } from '@/utils/structuredData'

interface AboutPageProps {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({
	params,
}: AboutPageProps): Promise<Metadata> {
	const { locale } = await params

	const translations = {
		hy: {
			title:
				'Մեր մասին - Chance Realty | 15+ տարվա անշարժ գույքի գծով գերազանցություն',
			description:
				'Ծանոթացեք Chance Realty-ի հետ, Հայաստանի առաջատար անշարժ գույքի գործակալությանը։ Ավելի քան 15 տարվա փորձ, 10,000+ գոհ հաճախորդներ։',
			keywords: [
				'Chance Realty մեր մասին',
				'անշարժ գույքի գործակալություն Հայաստան',
				'Երևանի անշարժ գույքի փորձագետներ',
				'հայկական անշարժ գույքի մասնագետներ',
			],
		},
		en: {
			title: 'About Us - Chance Realty | 15+ Years of Real Estate Excellence',
			description:
				"Learn about Chance Realty, Armenia's leading real estate agency. Over 15 years of experience, 10,000+ happy clients.",
			keywords: [
				'about Chance Realty',
				'real estate agency Armenia',
				'Yerevan real estate experts',
				'Armenian property specialists',
			],
		},
		ru: {
			title:
				'О нас - Chance Realty | 15+ лет превосходства в сфере недвижимости',
			description:
				'Узнайте больше о Chance Realty, ведущем агентстве недвижимости Армении. Более 15 лет опыта, 10,000+ довольных клиентов.',
			keywords: [
				'о Chance Realty',
				'агентство недвижимости Армения',
				'эксперты недвижимости Ереван',
				'специалисты по недвижимости в Армении',
			],
		},
	}

	const meta =
		translations[locale as keyof typeof translations] || translations.hy

	return {
		title: meta.title,
		description: meta.description,
		keywords: meta.keywords,
		openGraph: {
			title: meta.title,
			description: meta.description,
			images: ['/images/og-about.jpg'],
			url: `https://chancerealty.am/${locale}/about`,
			locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}/about`,
			languages: {
				'hy-AM': 'https://chancerealty.am/hy/about',
				'en-US': 'https://chancerealty.am/en/about',
				'ru-RU': 'https://chancerealty.am/ru/about',
			},
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
				name:
					locale === 'hy' ? 'Գլխավոր' : locale === 'ru' ? 'Главная' : 'Home',
				item: `https://chancerealty.am/${locale}`,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name:
					locale === 'hy'
						? 'Մեր մասին'
						: locale === 'ru'
						? 'О нас'
						: 'About Us',
				item: `https://chancerealty.am/${locale}/about`,
			},
		],
	}

	return (
		<>
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
