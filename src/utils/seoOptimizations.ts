// src/utils/seoOptimizations.ts - SEO optimizations with translations
import { Metadata } from 'next'
import { translations } from '../translations/translations'

export function generateLocalizedMetadata(
	language: 'hy' | 'en' | 'ru',
	page: 'home' | 'about' | 'contact' | 'properties',
	customData?: {
		title?: string
		description?: string
		keywords?: string[]
	}
): Metadata {
	const t = translations[language]
	const baseUrl = 'https://chancerealty.am'

	const metaData = {
		home: {
			title: t.heroTitle + ' | Chance Realty',
			description: t.heroSubtitle,
			keywords: [
				language === 'hy'
					? 'անշարժ գույք Հայաստան'
					: language === 'ru'
					? 'недвижимость Армения'
					: 'real estate Armenia',
				language === 'hy'
					? 'տներ վաճառք Երևան'
					: language === 'ru'
					? 'дома продажа Ереван'
					: 'houses for sale Yerevan',
				language === 'hy'
					? 'բնակարաններ վարձակալություն'
					: language === 'ru'
					? 'квартиры аренда'
					: 'apartments for rent',
				'Chance Realty',
			],
		},
		about: {
			title: t.aboutTitle + ' | Chance Realty',
			description: t.aboutSubtitle,
			keywords: [
				language === 'hy'
					? 'Chance Realty մեր մասին'
					: language === 'ru'
					? 'Chance Realty о нас'
					: 'Chance Realty about us',
				language === 'hy'
					? 'անշարժ գույքի գործակալություն'
					: language === 'ru'
					? 'агентство недвижимости'
					: 'real estate agency',
				language === 'hy'
					? 'փորձագետ թիմ'
					: language === 'ru'
					? 'команда экспертов'
					: 'expert team',
			],
		},
		contact: {
			title: t.contactTitle + ' | Chance Realty',
			description: t.contactSubtitle,
			keywords: [
				language === 'hy'
					? 'կապ Chance Realty'
					: language === 'ru'
					? 'контакты Chance Realty'
					: 'contact Chance Realty',
				language === 'hy'
					? 'անշարժ գույքի խորհրդատվություն'
					: language === 'ru'
					? 'консультация по недвижимости'
					: 'real estate consultation',
				'+374 00 000 000',
			],
		},
		properties: {
			title: t.propertiesTitle + ' | Chance Realty',
			description:
				language === 'hy'
					? 'Բացահայտեք անշարժ գույք Հայաստանում: Տներ, բնակարաններ, կոմերցիոն գույք և հող վաճառքի և վարձակալության համար:'
					: language === 'ru'
					? 'Откройте для себя недвижимость в Армении. Дома, квартиры, коммерческая недвижимость и земля на продажу и аренду.'
					: 'Discover real estate in Armenia. Houses, apartments, commercial properties and land for sale and rent.',
			keywords: [t.properties, t.houses, t.apartments, t.commercial, t.land],
		},
	}

	const pageData = metaData[page]

	return {
		title: customData?.title || pageData.title,
		description: customData?.description || pageData.description,
		keywords: customData?.keywords || pageData.keywords,
		openGraph: {
			title: customData?.title || pageData.title,
			description: customData?.description || pageData.description,
			url: `${baseUrl}/${language}/${page === 'home' ? '' : page}`,
			locale:
				language === 'hy' ? 'hy_AM' : language === 'ru' ? 'ru_RU' : 'en_US',
		},
		alternates: {
			canonical: `${baseUrl}/${language}/${page === 'home' ? '' : page}`,
			languages: {
				'hy-AM': `${baseUrl}/hy/${page === 'home' ? '' : page}`,
				'en-US': `${baseUrl}/en/${page === 'home' ? '' : page}`,
				'ru-RU': `${baseUrl}/ru/${page === 'home' ? '' : page}`,
			},
		},
	}
}
