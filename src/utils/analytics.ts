export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
	interface Window {
		gtag: (...args: unknown[]) => void
	}
}

// Google Analytics
export const pageview = (url: string) => {
	if (typeof window !== 'undefined' && GA_TRACKING_ID) {
		window.gtag('config', GA_TRACKING_ID, {
			page_location: url,
		})
	}
}

export const event = ({
	action,
	category,
	label,
	value,
}: {
	action: string
	category: string
	label?: string
	value?: number
}) => {
	if (typeof window !== 'undefined' && GA_TRACKING_ID) {
		window.gtag('event', action, {
			event_category: category,
			event_label: label,
			value: value,
		})
	}
}

// Property view tracking
export const trackPropertyView = (propertyId: string, propertyType: string) => {
	event({
		action: 'view_property',
		category: 'Property',
		label: `${propertyType}_${propertyId}`,
	})
}

// Search tracking
export const trackSearch = (
	searchTerm: string,
) => {
	event({
		action: 'search',
		category: 'Property Search',
		label: searchTerm,
	})
}

// Contact form tracking
export const trackContactForm = (source: string) => {
	event({
		action: 'submit_contact_form',
		category: 'Lead Generation',
		label: source,
	})
}
