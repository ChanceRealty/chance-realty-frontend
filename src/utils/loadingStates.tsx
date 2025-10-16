// src/utils/loadingStates.ts - Loading states with translations
import ErrorBoundary from '@/components/ErrorBoundary'
import { translations } from '../translations/translations'
import { JSX } from 'react'

export function getLoadingMessages(language: 'hy' | 'en' | 'ru') {
	const messages = {
		hy: [
			'Բեռնվում են գույքերը...',
			'Պատրաստվում է ցուցակը...',
			'Որոնվում են լավագույն տարբերակները...',
			'Հավաքագրվում են տվյալները...',
		],
		en: [
			'Loading properties...',
			'Preparing listings...',
			'Searching for the best options...',
			'Gathering data...',
		],
		ru: [
			'Загружаем недвижимость...',
			'Подготавливаем объявления...',
			'Ищем лучшие варианты...',
			'Собираем данные...',
		],
	}

	return messages[language]
}

export function createLoadingComponent(language: 'hy' | 'en' | 'ru') {
	const messages = getLoadingMessages(language)
	let currentIndex = 0

	return {
		getMessage: () => {
			const message = messages[currentIndex]
			currentIndex = (currentIndex + 1) % messages.length
			return message
		},

		component: (): JSX.Element => (
			<div className='flex flex-col items-center justify-center h-64'>
				<div className='relative'>
					<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200'></div>
					<div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0'></div>
				</div>
				<p className='mt-4 text-gray-600 font-medium animate-pulse'>
					{messages[0]}
				</p>
			</div>
		),
	}
}

// Performance monitoring
export const performanceMetrics = {
	measureTiming: (name: string, fn: () => void) => {
		// const start = performance.now()
		fn()
		// const end = performance.now()
	},

	measureAsync: async (name: string, fn: () => Promise<unknown>) => {
		// const start = performance.now()
		const result = await fn()
		// const end = performance.now()
		return result
	},

	trackWebVitals: () => {
		if (typeof window !== 'undefined') {
			// Track Largest Contentful Paint
			new PerformanceObserver(list => {
				// for (const entry of list.getEntries()) {
				// }
			}).observe({ entryTypes: ['largest-contentful-paint'] })

			// Track First Input Delay
			new PerformanceObserver(list => {
				for (const entry of list.getEntries()) {
					// const timing = entry as PerformanceEventTiming
				}
			}).observe({ entryTypes: ['first-input'] })
		}
	},
}

// SEO utilities
export const seoHelpers = {
	generateBreadcrumbs: (
		path: string,
		language: 'hy' | 'en' | 'ru',
		customLabels?: Record<string, string>
	) => {
		const t = translations[language]
		const segments = path.split('/').filter(Boolean)

		const breadcrumbs = [{ name: t.home, url: `/${language}` }]

		let currentPath = `/${language}`

		segments.slice(1).forEach((segment) => {
			currentPath += `/${segment}`

			const label =
				customLabels?.[segment] ||
				(segment === 'properties'
					? t.properties
					: segment === 'about'
					? t.about
					: segment === 'contact'
					? t.contact
					: segment)

			breadcrumbs.push({
				name: label,
				url: currentPath,
			})
		})

		return breadcrumbs
	},

	generateAlternateLanguageLinks: (currentPath: string) => {
		const cleanPath = currentPath.replace(/^\/(hy|en|ru)/, '')

		return [
			{ hrefLang: 'hy', href: `/hy${cleanPath}` },
			{ hrefLang: 'en', href: `/en${cleanPath}` },
			{ hrefLang: 'ru', href: `/ru${cleanPath}` },
			{ hrefLang: 'x-default', href: `/hy${cleanPath}` },
		]
	},
}

export { ErrorBoundary }