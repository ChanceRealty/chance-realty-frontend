import { formatPrice } from "./formatters"

// src/utils/accessibilityHelpers.ts - Accessibility improvements
export function generateAriaLabel(
	element: 'propertyCard' | 'navigationLink' | 'contactButton',
	data: Record<string, unknown>,
	language: 'hy' | 'en' | 'ru' = 'hy'
): string {
	switch (element) {
		case 'propertyCard': {
			const propertyData = data as {
				title: string
				price: number
				listing_type: string
				currency: string
				city?: { name: string }
			}
			return `${propertyData.title}, ${formatPrice(
				propertyData.price,
				propertyData.listing_type,
				propertyData.currency,
				language
			)}, ${propertyData.city?.name}`
		}

		case 'navigationLink': {
			const navData = data as { label: string }
			return `${
				language === 'hy'
					? 'Անցնել'
					: language === 'ru'
					? 'Перейти к'
					: 'Navigate to'
			} ${navData.label}`
		}

		case 'contactButton': {
			const contactData = data as { method: string }
			return `${
				language === 'hy'
					? 'Կապվել'
					: language === 'ru'
					? 'Связаться'
					: 'Contact'
			} ${contactData.method}`
		}

		default:
			return ''
	}
}

// Focus management for accessibility
export function manageFocus() {
	return {
		trapFocus: (element: HTMLElement) => {
			const focusableElements = element.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			const firstElement = focusableElements[0] as HTMLElement
			const lastElement = focusableElements[
				focusableElements.length - 1
			] as HTMLElement

			element.addEventListener('keydown', e => {
				if (e.key === 'Tab') {
					if (e.shiftKey) {
						if (document.activeElement === firstElement) {
							lastElement.focus()
							e.preventDefault()
						}
					} else {
						if (document.activeElement === lastElement) {
							firstElement.focus()
							e.preventDefault()
						}
					}
				}
			})
		},

		announceToScreenReader: (message: string) => {
			const announcement = document.createElement('div')
			announcement.setAttribute('aria-live', 'polite')
			announcement.setAttribute('aria-atomic', 'true')
			announcement.setAttribute('class', 'sr-only')
			announcement.textContent = message
			document.body.appendChild(announcement)

			setTimeout(() => {
				document.body.removeChild(announcement)
			}, 1000)
		},
	}
}
