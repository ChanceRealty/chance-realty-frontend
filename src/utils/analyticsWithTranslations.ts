// src/utils/analyticsWithTranslations.ts - Analytics with proper language tracking
export function trackPageView(
	url: string,
	language: 'hy' | 'en' | 'ru',
	title?: string
) {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
			page_location: url,
			page_title: title,
			custom_map: {
				dimension1: language, // Custom dimension for language
			},
		})
	}
}

export function trackPropertyInteraction(
	action: 'view' | 'save' | 'share' | 'contact',
	propertyId: string,
	propertyType: string,
	language: 'hy' | 'en' | 'ru'
) {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', action, {
			event_category: 'Property',
			event_label: `${propertyType}_${propertyId}`,
			custom_map: {
				dimension1: language,
				dimension2: propertyType,
			},
		})
	}
}
