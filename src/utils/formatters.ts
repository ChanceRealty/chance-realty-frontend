// src/utils/formatters.ts - Formatting utilities with translations
import { translations } from '../translations/translations';

export function formatPrice(
	price: number,
	listingType: string,
	currency = 'USD',
	language: 'hy' | 'en' | 'ru' = 'hy'
) {
	const t = translations[language]

	const formatted = new Intl.NumberFormat(
		language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'hy-AM',
		{
			style: 'currency',
			currency: currency,
			maximumFractionDigits: 0,
		}
	).format(price)

	switch (listingType) {
		case 'rent':
			return `${formatted}${t.month}`
		case 'daily_rent':
			return `${formatted}${t.day}`
		default:
			return formatted
	}
}

export function formatPropertyType(
	type: string,
	language: 'hy' | 'en' | 'ru' = 'hy'
) {
	const t = translations[language]

	switch (type) {
		case 'house':
			return t.house
		case 'apartment':
			return t.apartment
		case 'commercial':
			return t.commercial
		case 'land':
			return t.land
		default:
			return type
	}
}

export function formatListingType(
	type: string,
	language: 'hy' | 'en' | 'ru' = 'hy'
) {
	const t = translations[language]

	switch (type) {
		case 'sale':
			return t.forSale
		case 'rent':
			return t.forRent
		case 'daily_rent':
			return t.forDailyRent
		default:
			return type.toUpperCase()
	}
}

export function formatDate(
	date: string | Date,
	language: 'hy' | 'en' | 'ru' = 'hy',
	options?: Intl.DateTimeFormatOptions
) {
	const locale =
		language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'hy-AM'

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}

	return new Date(date).toLocaleDateString(locale, options || defaultOptions)
}
