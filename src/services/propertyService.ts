// services/propertyService.ts - Updated with hidden/exclusive filtering
import { PropertyFilter } from '../types/property'

const API_BASE_URL = 'https://realty-app-admin.vercel.app'

export function getCurrentLanguage(): 'hy' | 'en' | 'ru' {
	if (typeof window !== 'undefined') {
		// Check URL path
		const pathParts = window.location.pathname.split('/')
		const urlLang = pathParts[1]
		if (['hy', 'en', 'ru'].includes(urlLang)) {
			return urlLang as 'hy' | 'en' | 'ru'
		}

		// Check localStorage
		const savedLang = localStorage.getItem('preferred-language')
		if (savedLang && ['hy', 'en', 'ru'].includes(savedLang)) {
			return savedLang as 'hy' | 'en' | 'ru'
		}
	}

	return 'hy' // Default to Armenian
}

export async function getProperties(filter: PropertyFilter = {}) {
	try {
		const params = new URLSearchParams()
		const language = getCurrentLanguage()
		params.append('lang', language)

		// Add filter parameters to URL
		if (filter.property_type)
			params.append('property_type', filter.property_type)
		if (filter.listing_type) params.append('listing_type', filter.listing_type)
		if (filter.state_id) params.append('state_id', filter.state_id.toString())
		if (filter.city_id) params.append('city_id', filter.city_id.toString())
		if (filter.district_id)
			params.append('district_id', filter.district_id.toString())
		if (filter.min_price)
			params.append('min_price', filter.min_price.toString())
		if (filter.max_price)
			params.append('max_price', filter.max_price.toString())
		if (filter.bedrooms) params.append('bedrooms', filter.bedrooms.toString())
		if (filter.bathrooms)
			params.append('bathrooms', filter.bathrooms.toString())
		if (filter.sort_by) params.append('sort_by', filter.sort_by)
		if (filter.sort_order) params.append('sort_order', filter.sort_order)
		if (filter.page) params.append('page', filter.page.toString())
		if (filter.limit) params.append('limit', filter.limit.toString())

		// ✅ NEW: Add visibility and exclusivity filters
		if (filter.is_exclusive === true) {
			params.append('exclusive', 'true')
		}

		// ✅ For public frontend, we never want to show hidden properties
		// This is handled server-side, but we can also filter client-side as backup
		if (filter.show_hidden === true) {
			// Only admins should be able to see hidden properties
			// For public frontend, this should always be false or undefined
			console.warn('show_hidden should not be true in public frontend')
		}

		// Set default pagination with higher limits
		if (!filter.page) params.append('page', '1')
		if (!filter.limit) params.append('limit', '50')

		console.log(
			`✅ Fetching from PUBLIC endpoint: ${API_BASE_URL}/api/public/properties?${params.toString()}`
		)

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		if (!response.ok) {
			console.error(`API Error: ${response.status} ${response.statusText}`)
			const errorText = await response.text()
			console.error('Error response:', errorText)
			throw new Error(
				`Failed to fetch properties: ${response.status} ${response.statusText}`
			)
		}

		const data = await response.json()
		console.log('Raw API Response:', data)

		let properties = []

		if (Array.isArray(data)) {
			properties = data
		} else if (data && typeof data === 'object') {
			if (Array.isArray(data.properties)) {
				properties = data.properties
			} else if (Array.isArray(data.data)) {
				properties = data.data
			} else if (Array.isArray(data.results)) {
				properties = data.results
			} else if (Array.isArray(data.items)) {
				properties = data.items
			} else {
				console.warn('Unexpected API response format:', data)
				if (data.id || data.custom_id) {
					properties = [data]
				} else {
					properties = []
				}
			}
		} else {
			console.warn('Unexpected API response format:', data)
			properties = []
		}

		// ✅ NEW: Client-side filtering as backup for hidden properties
		// The server should already filter these, but this ensures safety
		const visibleProperties = properties.filter(property => {
			// Never show hidden properties in public frontend
			if (property.is_hidden === true) {
				console.warn(`Filtered out hidden property: ${property.custom_id}`)
				return false
			}

			// If exclusive filter is active, only show exclusive properties
			if (filter.is_exclusive === true && property.is_exclusive !== true) {
				return false
			}

			return true
		})

		console.log(
			`✅ Processed ${visibleProperties.length} visible properties out of ${properties.length} total`
		)
		return visibleProperties
	} catch (error) {
		console.error('Error fetching properties:', error)
		return []
	}
}

export async function getPropertyByCustomId(customId: string) {
	try {
		const language = getCurrentLanguage()
		console.log(
			`✅ Fetching property from PUBLIC endpoint: ${API_BASE_URL}/api/public/properties/${customId}`
		)

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/${customId}?lang=${language}`
		)

		if (!response.ok) {
			if (response.status === 404) {
				return null
			}
			throw new Error(
				`Failed to fetch property: ${response.status} ${response.statusText}`
			)
		}

		const property = await response.json()

		// ✅ NEW: Additional check for hidden properties
		// The server should handle this, but double-check for safety
		if (property.is_hidden === true) {
			console.warn(`Property ${customId} is hidden, returning null`)
			return null
		}

		return property
	} catch (error) {
		console.error('Error fetching property by custom ID:', error)
		throw error
	}
}

export async function getStates() {
	try {
		const language = getCurrentLanguage()
		console.log('Fetching states...')

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/states?lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		if (!response.ok) {
			console.error(
				`Failed to fetch states: ${response.status} ${response.statusText}`
			)
			return []
		}

		const states = await response.json()
		console.log('States fetched:', states)
		return Array.isArray(states) ? states : []
	} catch (error) {
		console.error('Error fetching states:', error)
		return []
	}
}

export async function getCitiesByState(stateId: number) {
	try {
		const language = getCurrentLanguage()
		console.log(`Fetching cities for state ${stateId}...`)

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/cities/${stateId}?lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		if (!response.ok) {
			console.error(
				`Failed to fetch cities: ${response.status} ${response.statusText}`
			)
			return []
		}

		const cities = await response.json()
		console.log('Cities fetched:', cities)
		return Array.isArray(cities) ? cities : []
	} catch (error) {
		console.error('Error fetching cities:', error)
		return []
	}
}

export async function getDistrictsByState(stateId: number) {
	try {
		const language = getCurrentLanguage()
		console.log(`Fetching districts for state ${stateId}...`)

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/districts/${stateId}?lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		if (!response.ok) {
			console.error(
				`Failed to fetch districts: ${response.status} ${response.statusText}`
			)
			return []
		}

		const districts = await response.json()
		console.log('Districts fetched:', districts)
		return Array.isArray(districts) ? districts : []
	} catch (error) {
		console.error('Error fetching districts:', error)
		return []
	}
}

export async function getPropertyFeatures() {
	try {
		const language = getCurrentLanguage()

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/features?lang=${language}`
		)

		if (!response.ok) {
			throw new Error(
				`Failed to fetch features: ${response.status} ${response.statusText}`
			)
		}

		const features = await response.json()
		return features
	} catch (error) {
		console.error('Error fetching property features:', error)
		throw error
	}
}

export async function getFeaturedProperties() {
	try {
		const language = getCurrentLanguage()

		console.log('Fetching featured properties...')
		const response = await fetch(
			`${API_BASE_URL}/api/public/properties?featured=true&limit=20&lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		console.log(`Featured properties response status: ${response.status}`)

		if (!response.ok) {
			console.error(
				'Failed to fetch featured properties:',
				response.status,
				response.statusText
			)
			return []
		}

		const data = await response.json()
		console.log('Featured properties raw response:', data)

		let properties = []
		if (Array.isArray(data)) {
			properties = data
		} else if (data && typeof data === 'object') {
			if (Array.isArray(data.properties)) {
				properties = data.properties
			} else if (Array.isArray(data.data)) {
				properties = data.data
			} else if (Array.isArray(data.results)) {
				properties = data.results
			} else {
				console.warn(
					'Unexpected API response format for featured properties:',
					data
				)
				properties = []
			}
		}

		// ✅ NEW: Filter out hidden properties from featured
		const visibleProperties = properties.filter(property => !property.is_hidden)

		console.log(
			`✅ Received ${visibleProperties.length} visible featured properties`
		)
		return visibleProperties
	} catch (error) {
		console.error('Error fetching featured properties:', error)
		return []
	}
}

export async function getRecentProperties(limit: number = 12) {
	try {
		const language = getCurrentLanguage()

		console.log('Fetching recent properties...')
		const response = await fetch(
			`${API_BASE_URL}/api/public/properties?sort_by=created_at&sort_order=desc&limit=${limit}&lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		console.log(`Recent properties response status: ${response.status}`)

		if (!response.ok) {
			console.error(
				'Failed to fetch recent properties:',
				response.status,
				response.statusText
			)
			return []
		}

		const data = await response.json()
		console.log('Recent properties raw response:', data)

		let properties = []
		if (Array.isArray(data)) {
			properties = data
		} else if (data && typeof data === 'object') {
			if (Array.isArray(data.properties)) {
				properties = data.properties
			} else if (Array.isArray(data.data)) {
				properties = data.data
			} else if (Array.isArray(data.results)) {
				properties = data.results
			} else {
				console.warn(
					'Unexpected API response format for recent properties:',
					data
				)
				properties = []
			}
		}

		// ✅ NEW: Filter out hidden properties from recent
		const visibleProperties = properties.filter(property => !property.is_hidden)

		console.log(
			`✅ Received ${visibleProperties.length} visible recent properties`
		)
		return visibleProperties
	} catch (error) {
		console.error('Error fetching recent properties:', error)
		return []
	}
}

// ✅ NEW: Get exclusive properties
export async function getExclusiveProperties(limit: number = 12) {
	try {
		const language = getCurrentLanguage()

		console.log('Fetching exclusive properties...')
		const response = await fetch(
			`${API_BASE_URL}/api/public/properties?exclusive=true&limit=${limit}&lang=${language}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		console.log(`Exclusive properties response status: ${response.status}`)

		if (!response.ok) {
			console.error(
				'Failed to fetch exclusive properties:',
				response.status,
				response.statusText
			)
			return []
		}

		const data = await response.json()
		console.log('Exclusive properties raw response:', data)

		let properties = []
		if (Array.isArray(data)) {
			properties = data
		} else if (data && typeof data === 'object') {
			if (Array.isArray(data.properties)) {
				properties = data.properties
			} else if (Array.isArray(data.data)) {
				properties = data.data
			} else if (Array.isArray(data.results)) {
				properties = data.results
			} else {
				console.warn(
					'Unexpected API response format for exclusive properties:',
					data
				)
				properties = []
			}
		}

		// ✅ Filter out hidden properties and ensure they're exclusive
		const visibleExclusiveProperties = properties.filter(
			property => !property.is_hidden && property.is_exclusive === true
		)

		console.log(
			`✅ Received ${visibleExclusiveProperties.length} visible exclusive properties`
		)
		return visibleExclusiveProperties
	} catch (error) {
		console.error('Error fetching exclusive properties:', error)
		return []
	}
}

export async function getPropertyStatuses() {
	try {
		const language = getCurrentLanguage()

		const response = await fetch(
			`${API_BASE_URL}/api/public/properties/statuses?lang=${language}`
		)

		if (!response.ok) {
			throw new Error(
				`Failed to fetch statuses: ${response.status} ${response.statusText}`
			)
		}

		const statuses = await response.json()
		return statuses
	} catch (error) {
		console.error('Error fetching property statuses:', error)
		throw error
	}
}

// Keep existing translation helper functions
export function getTranslatedCityName(
	cityName: string,
	language: 'hy' | 'en' | 'ru'
): string {
	const cityTranslations: Record<string, Record<string, string>> = {
		Աշտարակ: { hy: 'Աշտարակ', en: 'Ashtarak', ru: 'Аштарак' },
		Ապարան: { hy: 'Ապարան', en: 'Aparan', ru: 'Апаран' },
		Թալին: { hy: 'Թալին', en: 'Talin', ru: 'Талин' },
		Արտաշատ: { hy: 'Արտաշատ', en: 'Artashat', ru: 'Арташат' },
		Արարատ: { hy: 'Արարատ', en: 'Ararat', ru: 'Арарат' },
		Մասիս: { hy: 'Մասիս', en: 'Masis', ru: 'Масис' },
		Արմավիր: { hy: 'Արմավիր', en: 'Armavir', ru: 'Армавир' },
		Վաղարշապատ: { hy: 'Վաղարշապատ', en: 'Vagharshapat', ru: 'Вагаршапат' },
		Գավառ: { hy: 'Գավառ', en: 'Gavar', ru: 'Гавар' },
		Սևան: { hy: 'Սևան', en: 'Sevan', ru: 'Севан' },
		Աբովյան: { hy: 'Աբովյան', en: 'Abovyan', ru: 'Абовян' },
		Հրազդան: { hy: 'Հրազդան', en: 'Hrazdan', ru: 'Раздан' },
		Վեդի: { hy: 'Վեդի', en: 'Vedi', ru: 'Веди' },
		Վարդենիս: { hy: 'Վարդենիս', en: 'Vardenis', ru: 'Варденис' },
		Մարտունի: { hy: 'Մարտունի', en: 'Martuni', ru: 'Мартуни' },
		Չարենցավան: { hy: 'Չարենցավան', en: 'Charentsavan', ru: 'Чаренцаван' },
		Ցախկաձոր: { hy: 'Ցախկաձոր', en: 'Tsaghkadzor', ru: 'Цахкадзор' },
		Վանաձոր: { hy: 'Վանաձոր', en: 'Vanadzor', ru: 'Ванадзор' },
		Ալավերդի: { hy: 'Ալավերդի', en: 'Alaverdi', ru: 'Алаверди' },
		Ստեփանավան: { hy: 'Ստեփանավան', en: 'Stepanavan', ru: 'Степанаван' },
		Թաշիր: { hy: 'Թաշիր', en: 'Tashir', ru: 'Ташир' },
		Սպիտակ: { hy: 'Սպիտակ', en: 'Spitak', ru: 'Спитак' },
		Գյումրի: { hy: 'Գյումրի', en: 'Gyumri', ru: 'Гюмри' },
		Արթիկ: { hy: 'Արթիկ', en: 'Artik', ru: 'Артик' },
		Մարալիկ: { hy: 'Մարալիկ', en: 'Maralik', ru: 'Маралик' },
		Կապան: { hy: 'Կապան', en: 'Kapan', ru: 'Капан' },
		Գորիս: { hy: 'Գորիս', en: 'Goris', ru: 'Горис' },
		Մեղրի: { hy: 'Մեղրի', en: 'Meghri', ru: 'Мегри' },
		Սիսիան: { hy: 'Սիսիան', en: 'Sisian', ru: 'Сисиан' },
		Իջևան: { hy: 'Իջևան', en: 'Ijevan', ru: 'Иджеван' },
		Դիլիջան: { hy: 'Դիլիջան', en: 'Dilijan', ru: 'Дилижан' },
		Նոյեմբերյան: { hy: 'Նոյեմբերյան', en: 'Noyemberyan', ru: 'Ноемберян' },
		Բերդ: { hy: 'Բերդ', en: 'Berd', ru: 'Берд' },
		Եղեգնաձոր: { hy: 'Եղեգնաձոր', en: 'Yeghegnadzor', ru: 'Егегнадзор' },
		Վայք: { hy: 'Վայք', en: 'Vayk', ru: 'Вайк' },
		Ջերմուկ: { hy: 'Ջերմուկ', en: 'Jermuk', ru: 'Джермук' },
		Երևան: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },

		// English variations for compatibility
		Ashtarak: { hy: 'Աշտարակ', en: 'Ashtarak', ru: 'Аштарак' },
		Aparan: { hy: 'Ապարան', en: 'Aparan', ru: 'Апаран' },
		Talin: { hy: 'Թալին', en: 'Talin', ru: 'Талин' },
		Artashat: { hy: 'Արտաշատ', en: 'Artashat', ru: 'Арташат' },
		Ararat: { hy: 'Արարատ', en: 'Ararat', ru: 'Арарат' },
		Masis: { hy: 'Մասիս', en: 'Masis', ru: 'Масис' },
		Armavir: { hy: 'Արմավիր', en: 'Armavir', ru: 'Армавир' },
		Vagharshapat: { hy: 'Վաղարշապատ', en: 'Vagharshapat', ru: 'Вагаршапат' },
		Ejmiadzin: { hy: 'Վաղարշապատ', en: 'Ejmiadzin', ru: 'Эчмиадзин' },
		Gavar: { hy: 'Գավառ', en: 'Gavar', ru: 'Гавар' },
		Sevan: { hy: 'Սևան', en: 'Sevan', ru: 'Севан' },
		Abovyan: { hy: 'Աբովյան', en: 'Abovyan', ru: 'Абовян' },
		Hrazdan: { hy: 'Հրազդան', en: 'Hrazdan', ru: 'Раздан' },
		Razdan: { hy: 'Հրազդան', en: 'Razdan', ru: 'Раздан' },
		Vedi: { hy: 'Վեդի', en: 'Vedi', ru: 'Веди' },
		Vardenis: { hy: 'Վարդենիս', en: 'Vardenis', ru: 'Варденис' },
		Martuni: { hy: 'Մարտունի', en: 'Martuni', ru: 'Мартуни' },
		Charentsavan: { hy: 'Չարենցավան', en: 'Charentsavan', ru: 'Чаренцаван' },
		Tsaghkadzor: { hy: 'Ցախկաձոր', en: 'Tsaghkadzor', ru: 'Цахкадзор' },
		Vanadzor: { hy: 'Վանաձոր', en: 'Vanadzor', ru: 'Ванадзор' },
		Alaverdi: { hy: 'Ալավերդի', en: 'Alaverdi', ru: 'Алаверди' },
		Stepanavan: { hy: 'Ստեփանավան', en: 'Stepanavan', ru: 'Степанаван' },
		Tashir: { hy: 'Թաշիր', en: 'Tashir', ru: 'Ташир' },
		Spitak: { hy: 'Սպիտակ', en: 'Spitak', ru: 'Спитак' },
		Gyumri: { hy: 'Գյումրի', en: 'Gyumri', ru: 'Гюмри' },
		Artik: { hy: 'Արթիկ', en: 'Artik', ru: 'Артик' },
		Maralik: { hy: 'Մարալիկ', en: 'Maralik', ru: 'Маралик' },
		Kapan: { hy: 'Կապան', en: 'Kapan', ru: 'Капан' },
		Goris: { hy: 'Գորիս', en: 'Goris', ru: 'Горис' },
		Meghri: { hy: 'Մեղրի', en: 'Meghri', ru: 'Мегри' },
		Sisian: { hy: 'Սիսիան', en: 'Sisian', ru: 'Сисиан' },
		Ijevan: { hy: 'Իջևան', en: 'Ijevan', ru: 'Иджеван' },
		Dilijan: { hy: 'Դիլիջան', en: 'Dilijan', ru: 'Дилижан' },
		Noyemberyan: { hy: 'Նոյեմբերյան', en: 'Noyemberyan', ru: 'Ноемберян' },
		Berd: { hy: 'Բերդ', en: 'Berd', ru: 'Берд' },
		Yeghegnadzor: { hy: 'Եղեգնաձոր', en: 'Yeghegnadzor', ru: 'Егегнадзор' },
		Vayk: { hy: 'Վայք', en: 'Vayk', ru: 'Вайк' },
		Jermuk: { hy: 'Ջերմուկ', en: 'Jermuk', ru: 'Джермук' },
		Yerevan: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },
	}

	return cityTranslations[cityName]?.[language] || cityName
}

export function getTranslatedStateName(
	stateName: string,
	language: 'hy' | 'en' | 'ru'
): string {
	const stateTranslations: Record<string, Record<string, string>> = {
		Արագածոտն: { hy: 'Արագածոտն', en: 'Aragatsotn', ru: 'Арагацотн' },
		Արարատ: { hy: 'Արարատ', en: 'Ararat', ru: 'Арарат' },
		Արմավիր: { hy: 'Արմավիր', en: 'Armavir', ru: 'Армавир' },
		Գեղարքունիք: { hy: 'Գեղարքունիք', en: 'Gegharkunik', ru: 'Гегаркуник' },
		Կոտայք: { hy: 'Կոտայք', en: 'Kotayk', ru: 'Котайк' },
		Լոռի: { hy: 'Լոռի', en: 'Lori', ru: 'Лори' },
		Շիրակ: { hy: 'Շիրակ', en: 'Shirak', ru: 'Ширак' },
		Սյունիք: { hy: 'Սյունիք', en: 'Syunik', ru: 'Сюник' },
		Տավուշ: { hy: 'Տավուշ', en: 'Tavush', ru: 'Тавуш' },
		'Վայոց Ձոր': { hy: 'Վայոց Ձոր', en: 'Vayots Dzor', ru: 'Вайоц Дзор' },
		Երևան: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },

		// English variations for compatibility
		Aragatsotn: { hy: 'Արագածոտն', en: 'Aragatsotn', ru: 'Арагацотн' },
		Ararat: { hy: 'Արարատ', en: 'Ararat', ru: 'Арарат' },
		Armavir: { hy: 'Արմավիր', en: 'Armavir', ru: 'Армавир' },
		Gegharkunik: { hy: 'Գեղարքունիք', en: 'Gegharkunik', ru: 'Гегаркуник' },
		Kotayk: { hy: 'Կոտայք', en: 'Kotayk', ru: 'Котайк' },
		Lori: { hy: 'Լոռի', en: 'Lori', ru: 'Лори' },
		Shirak: { hy: 'Շիրակ', en: 'Shirak', ru: 'Ширак' },
		Syunik: { hy: 'Սյունիք', en: 'Syunik', ru: 'Сюник' },
		Tavush: { hy: 'Տավուշ', en: 'Tavush', ru: 'Тавуш' },
		'Vayots Dzor': { hy: 'Վայոց Ձոր', en: 'Vayots Dzor', ru: 'Вайоц Дзор' },
		Yerevan: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },
	}

	return stateTranslations[stateName]?.[language] || stateName
}

export function getTranslatedField(
	obj: Record<string, string | undefined>,
	fieldName: string,
	language: 'hy' | 'en' | 'ru' = 'hy'
): string {
	if (!obj) return ''

	// Check for translated fields first
	const translatedFieldName = `${fieldName}_${language}`
	if (obj[translatedFieldName]) {
		return obj[translatedFieldName]
	}

	// For Armenian, check if there's a specific Armenian field
	if (language === 'hy') {
		const armenianFieldName = `${fieldName}_hy`
		if (obj[armenianFieldName]) {
			return obj[armenianFieldName]
		}
	}

	// Fall back to original field
	return obj[fieldName] || ''
}

// Export helper to check if translation exists
export function hasTranslation(
	obj: Record<string, string | undefined>,
	fieldName: string,
	language: 'hy' | 'en' | 'ru'
): boolean {
	if (!obj) return false

	if (language === 'hy') {
		return !!obj[fieldName]
	}

	const translatedFieldName = `${fieldName}_${language}`
	return !!obj[translatedFieldName]
}
