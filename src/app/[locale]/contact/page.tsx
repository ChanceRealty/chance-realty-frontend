// src/app/[locale]/contact/page.tsx - Fixed
import { Metadata } from 'next'
import ContactClient from './ContactClient'

interface ContactPageProps {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({
	params,
}: ContactPageProps): Promise<Metadata> {
	// ✅ FIX: Properly await params
	const { locale } = await params

	const translations = {
		hy: {
			title:
				'Կապ մեզ հետ - Ստացեք փորձագետ անշարժ գույքի խորհուրդ | Chance Realty',
			description:
				'Կապվեք Chance Realty-ի հետ փորձագետ անշարժ գույքի խորհրդատվության համար Հայաստանում։',
		},
		en: {
			title: 'Contact Us - Get Expert Real Estate Advice | Chance Realty',
			description:
				'Contact Chance Realty for expert real estate advice in Armenia.',
		},
		ru: {
			title:
				'Свяжитесь с нами - Получите экспертную консультацию | Chance Realty',
			description:
				'Свяжитесь с Chance Realty для получения экспертной консультации по недвижимости в Армении.',
		},
	}

	const meta =
		translations[locale as keyof typeof translations] || translations.en

	return {
		title: meta.title,
		description: meta.description,
		keywords: [
			'contact Chance Realty',
			'real estate consultation Armenia',
			'Yerevan real estate office',
			'property advice Armenia',
		],
		openGraph: {
			title: meta.title,
			description: meta.description,
			images: ['/images/og-contact.jpg'],
			url: `https://chancerealty.am/${locale}/contact`,
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}/contact`,
		},
	}
}

export default async function ContactPage({ params }: ContactPageProps) {
	const { locale } = await params

	const contactSchema = {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name: 'Contact Chance Realty',
		description:
			'Get in touch with Chance Realty for expert real estate advice.',
		url: `https://chancerealty.am/${locale}/contact`,
		mainEntity: {
			'@type': 'Organization',
			name: 'Chance Realty',
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+374-00-000-000',
				contactType: 'customer service',
				email: 'info@chancerealty.am',
				availableLanguage: ['English', 'Armenian', 'Russian'],
			},
		},
	}

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
				name: 'Contact',
				item: `https://chancerealty.am/${locale}/contact`,
			},
		],
	}

	return (
		<>
			{/* Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(contactSchema),
				}}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>

			<ContactClient />
		</>
	)
}
