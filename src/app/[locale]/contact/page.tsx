// src/app/[locale]/contact/page.tsx - Updated with dynamic multilingual titles
import { Metadata } from 'next'
import ContactClient from './ContactClient'

interface ContactPageProps {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({
	params,
}: ContactPageProps): Promise<Metadata> {
	const { locale } = await params

	const translations = {
		hy: {
			title:
				'Կապ մեզ հետ - Ստացեք փորձագետ անշարժ գույքի խորհուրդ | Chance Realty',
			description:
				'Կապվեք Chance Realty-ի հետ փորձագետ անշարժ գույքի խորհրդատվության համար Հայաստանում։ Զանգահարեք +374 41 194 646 կամ այցելեք մեր օֆիս Երևանում։',
			keywords: [
				'կապ Chance Realty',
				'անշարժ գույքի խորհրդատվություն Հայաստան',
				'Երևանի անշարժ գույքի օֆիս',
				'գույքի խորհուրդ Հայաստան',
				'+374 41 194 646',
			],
		},
		en: {
			title: 'Contact Us - Get Expert Real Estate Advice | Chance Realty',
			description:
				'Contact Chance Realty for expert real estate advice in Armenia. Call +374 41 194 646 or visit our office in Yerevan.',
			keywords: [
				'contact Chance Realty',
				'real estate consultation Armenia',
				'Yerevan real estate office',
				'property advice Armenia',
				'+374 41 194 646',
			],
		},
		ru: {
			title:
				'Свяжитесь с нами - Получите экспертную консультацию | Chance Realty',
			description:
				'Свяжитесь с Chance Realty для получения экспертной консультации по недвижимости в Армении. Звоните +374 41 194 646 или посетите наш офис в Ереване.',
			keywords: [
				'контакт Chance Realty',
				'консультация по недвижимости Армения',
				'офис недвижимости Ереван',
				'советы по недвижимости Армения',
				'+374 41 194 646',
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
			images: ['/images/og-contact.jpg'],
			url: `https://chancerealty.am/${locale}/contact`,
			locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
		},
		alternates: {
			canonical: `https://chancerealty.am/${locale}/contact`,
			languages: {
				'hy-AM': 'https://chancerealty.am/hy/contact',
				'en-US': 'https://chancerealty.am/en/contact',
				'ru-RU': 'https://chancerealty.am/ru/contact',
			},
		},
	}
}

export default async function ContactPage({ params }: ContactPageProps) {
	const { locale } = await params

	const contactSchema = {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name:
			locale === 'hy'
				? 'Կապ Chance Realty-ի հետ'
				: locale === 'ru'
				? 'Контакты Chance Realty'
				: 'Contact Chance Realty',
		description:
			locale === 'hy'
				? 'Կապվեք Chance Realty-ի հետ փորձագետ անշարժ գույքի խորհրդատվության համար։'
				: locale === 'ru'
				? 'Свяжитесь с Chance Realty для получения экспертной консультации по недвижимости.'
				: 'Get in touch with Chance Realty for expert real estate advice.',
		url: `https://chancerealty.am/${locale}/contact`,
		mainEntity: {
			'@type': 'Organization',
			name: 'Chance Realty',
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+374 41 194 646',
				contactType: 'customer service',
				email: 'chancerealty4646@gmail.com',
				availableLanguage: ['Armenian', 'English', 'Russian'],
				areaServed: 'Armenia',
			},
			address: {
				'@type': 'PostalAddress',
				streetAddress: 'Shirvanzade 24/30',
				addressLocality: 'Yerevan',
				addressCountry: 'Armenia',
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
				name:
					locale === 'hy' ? 'Գլխավոր' : locale === 'ru' ? 'Главная' : 'Home',
				item: `https://chancerealty.am/${locale}`,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name:
					locale === 'hy' ? 'Կապ' : locale === 'ru' ? 'Контакты' : 'Contact',
				item: `https://chancerealty.am/${locale}/contact`,
			},
		],
	}

	return (
		<>
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
