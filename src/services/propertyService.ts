// services/propertyService.ts - Updated with hidden/exclusive filtering
import { PropertyFilter } from '../types/property'

const API_BASE_URL = 'https://chance-realty-admin.vercel.app'

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

// Enhanced getProperties with better logging and parameter handling
export async function getProperties(filter: PropertyFilter = {}) {
	try {
		const params = new URLSearchParams()
		const language = getCurrentLanguage()
		params.append('lang', language)

		// Basic filters
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

		// Common attributes (house & apartment)
		if (filter.bedrooms) params.append('bedrooms', filter.bedrooms.toString())
		if (filter.bathrooms)
			params.append('bathrooms', filter.bathrooms.toString())

		// Area filters - THIS IS THE KEY PART
		if (filter.min_area_sqft)
			params.append('min_area_sqft', filter.min_area_sqft.toString())
		if (filter.max_area_sqft)
			params.append('max_area_sqft', filter.max_area_sqft.toString())
		if (filter.min_area_acres)
			params.append('min_area_acres', filter.min_area_acres.toString())
		if (filter.max_area_acres)
			params.append('max_area_acres', filter.max_area_acres.toString())

		// House-specific
		if (filter.floors) params.append('floors', filter.floors.toString())
		if (filter.min_lot_size_sqft)
			params.append('min_lot_size_sqft', filter.min_lot_size_sqft.toString())
		if (filter.max_lot_size_sqft)
			params.append('max_lot_size_sqft', filter.max_lot_size_sqft.toString())

		// Apartment-specific
		if (filter.floor) params.append('floor', filter.floor.toString())
		if (filter.total_floors)
			params.append('total_floors', filter.total_floors.toString())

		// Common attribute
		if (filter.ceiling_height)
			params.append('ceiling_height', filter.ceiling_height.toString())

		// Commercial-specific
		if (filter.business_type)
			params.append('business_type', filter.business_type)

		// Features
		if (filter.features && filter.features.length > 0) {
			params.append('features', filter.features.join(','))
		}

		// Sorting and pagination
		if (filter.sort_by) params.append('sort_by', filter.sort_by)
		if (filter.sort_order) params.append('sort_order', filter.sort_order)
		if (filter.page) params.append('page', filter.page.toString())
		if (filter.limit) params.append('limit', filter.limit.toString())

		// Visibility filters
		if (filter.is_exclusive === true) {
			params.append('exclusive', 'true')
		}

		// Set defaults
		if (!filter.page) params.append('page', '1')
		if (!filter.limit) params.append('limit', '50')

		const apiUrl = `${API_BASE_URL}/api/public/properties?${params.toString()}`
		
		// ✅ ADD THIS: Log the full URL to see what's being sent
		console.log('🔍 FULL API URL:', apiUrl)
		console.log('🔍 FILTER OBJECT:', filter)

		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			console.error(`API Error: ${response.status} ${response.statusText}`)
			const errorText = await response.text()
			console.error('Error response:', errorText)
			throw new Error(
				`Failed to fetch properties: ${response.status} ${response.statusText}`
			)
		}

		const data = await response.json()
		console.log('📦 Raw API Response:', data)

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

		// Filter hidden properties
		const visibleProperties = properties.filter(property => {
			// Скрытые
			if (property.is_hidden && !filter.show_hidden) return false

			// Эксклюзивные
			if (filter.is_exclusive === true && property.is_exclusive !== true)
				return false

			// Bedrooms
			if (filter.bedrooms && property.attributes?.bedrooms !== filter.bedrooms)
				return false

			// Bathrooms
			if (
				filter.bathrooms &&
				property.attributes?.bathrooms !== filter.bathrooms
			)
				return false

			// Floors (house & commercial)
			if (filter.floors) {
				if (
					(property.property_type === 'house' ||
						property.property_type === 'commercial') &&
					property.attributes?.floors !== filter.floors
				) {
					return false
				}
			}

			// Floor (apartment)
			if (
				filter.floor &&
				property.property_type === 'apartment' &&
				property.attributes?.floor !== filter.floor
			) {
				return false
			}

			// Total floors (apartment)
			if (
				filter.total_floors &&
				property.property_type === 'apartment' &&
				property.attributes?.total_floors !== filter.total_floors
			) {
				return false
			}

			// Area (sqft)
			if (
				filter.min_area_sqft &&
				property.attributes?.area_sqft < filter.min_area_sqft
			)
				return false
			if (
				filter.max_area_sqft &&
				property.attributes?.area_sqft > filter.max_area_sqft
			)
				return false

			// Lot size (house)
			if (
				filter.min_lot_size_sqft &&
				property.property_type === 'house' &&
				property.attributes?.lot_size_sqft &&
				property.attributes.lot_size_sqft < filter.min_lot_size_sqft
			)
				return false
			if (
				filter.max_lot_size_sqft &&
				property.property_type === 'house' &&
				property.attributes?.lot_size_sqft &&
				property.attributes.lot_size_sqft > filter.max_lot_size_sqft
			)
				return false

			// Area acres (land)
			if (
				filter.min_area_acres &&
				property.property_type === 'land' &&
				property.attributes?.area_acres < filter.min_area_acres
			)
				return false
			if (
				filter.max_area_acres &&
				property.property_type === 'land' &&
				property.attributes?.area_acres > filter.max_area_acres
			)
				return false

			// Ceiling height
			if (
				filter.ceiling_height &&
				property.attributes?.ceiling_height !== filter.ceiling_height
			)
				return false

			// Business type (commercial)
			if (
				filter.business_type &&
				property.property_type === 'commercial' &&
				property.attributes?.business_type !== filter.business_type
			)
				return false

			// Features
			if (filter.features && filter.features.length > 0 && property.features) {
				const hasAllFeatures = filter.features.every(f =>
					property.features?.some(pf => pf.id === f)
				)
				if (!hasAllFeatures) return false
			}

			return true
		})


	
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
Ցախկաձոր: { hy: 'Ցախկաձոր', en: 'Tsakhkadzor', ru: 'Цахкадзор' },
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
Նոյեմբերյան: { hy: 'Նոյեմբերյան', en: 'Noyemberyan', ru: 'Нойемберян' },
Բերդ: { hy: 'Բերդ', en: 'Berd', ru: 'Берд' },
Եղեգնաձոր: { hy: 'Եղեգնաձոր', en: 'Yeghegnadzor', ru: 'Ехегнадзор' },
Վայք: { hy: 'Վայք', en: 'Vayk', ru: 'Вайк' },
Ջերմուկ: { hy: 'Ջերմուկ', en: 'Jermuk', ru: 'Джермук' },
Երևան: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' },
Պռոշյան: { hy: 'Պռոշյան', en: 'Proshyan', ru: 'Прошян' },
Աղվերան: { hy: 'Աղվերան', en: 'Aghveran', ru: 'Агверан' },
Ակունք: { hy: 'Ակունք', en: 'Akunk', ru: 'Акунк' },
Ալափարս: { hy: 'Ալափարս', en: 'Alapars', ru: 'Алапарс' },
Արագյուղ: { hy: 'Արագյուղ', en: 'Aragyugh', ru: 'Арагюх' },
Արամուս: { hy: 'Արամուս', en: 'Aramus', ru: 'Арамус' },
Արգել: { hy: 'Արգել', en: 'Argel', ru: 'Аргел' },
Առինջ: { hy: 'Առինջ', en: 'Arinj', ru: 'Аринж' },
Արզական: { hy: 'Արզական', en: 'Arzakan', ru: 'Арзакан' },
Արզնի: { hy: 'Արզնի', en: 'Arzni', ru: 'Арзни' },
Բալահովիտ: { hy: 'Բալահովիտ', en: 'Balahovit', ru: 'Балаховит' },
Բջնի: { hy: 'Բջնի', en: 'Bjni', ru: 'Бжни' },
Բյուրեղավան: { hy: 'Բյուրեղավան', en: 'Byureghavan', ru: 'Бюрехаван' },
Ձորաղբյուր: { hy: 'Ձորաղբյուր', en: 'Dzoraghbyur', ru: 'Дзоргахбюр' },
Գառնի: { hy: 'Գառնի', en: 'Garni', ru: 'Гарни' },
Գետամեջ: { hy: 'Գետամեջ', en: 'Getamej', ru: 'Гетамедж' },
Գողթ: { hy: 'Գողթ', en: 'Goght', ru: 'Гогт' },
Ջրվեժ: { hy: 'Ջրվեժ', en: 'Jrvezh', ru: 'Джрвеж' },
Կամարիս: { hy: 'Կամարիս', en: 'Kamaris', ru: 'Камарис' },
Քանաքեռավան: { hy: 'Քանաքեռավան', en: 'Kanakeravan', ru: 'Канакераван' },
Քարաշամբ: { hy: 'Քարաշամբ', en: 'Karashamb', ru: 'Карашамб' },
Քասախ: { hy: 'Քասախ', en: 'Kasakh', ru: 'Касах' },
Մայակովսկի: { hy: 'Մայակովսկի', en: 'Mayakovski', ru: 'Маяковски' },
Մրգաշեն: { hy: 'Մրգաշեն', en: 'Mrgashen', ru: 'Мргашен' },
'Նոր Արտամետ': { hy: 'Նոր Արտամետ', en: 'Nor Artamet', ru: 'Нор Артамет' },
'Նոր գեղի': { hy: 'Նոր գեղի', en: 'Nor Geghi', ru: 'Нор Гехи' },
'Նոր գյուղ': { hy: 'Նոր գյուղ', en: 'Nor Gyugh', ru: 'Нор Гюх' },
'Նոր Հաճըն': { hy: 'Նոր Հաճըն', en: 'Nor Hachn', ru: 'Нор Хачн' },
'Նոր երզնկա': { hy: 'Նոր երզնկա', en: 'Nor Yerznka', ru: 'Нор Ерзнка' },
Նուռնուս: { hy: 'Նուռնուս', en: 'Nurnus', ru: 'Нурнус' },
Պտղնի: { hy: 'Պտղնի', en: 'Ptghni', ru: 'Птгхни' },
Սոլակ: { hy: 'Սոլակ', en: 'Solak', ru: 'Солак' },
'Վերին Պտղնի': { hy: 'Վերին Պտղնի', en: 'Verin Ptghni', ru: 'Верин Птгхни' },
Եղվարդ: { hy: 'Եղվարդ', en: 'Yegvard', ru: 'Егвард' },
Զորավան: { hy: 'Զորավան', en: 'Zoravan', ru: 'Зораван' },
Զովք: { hy: 'Զովք', en: 'Zovk', ru: 'Зовк' },
Ձովունի: { hy: 'Ձովունի', en: 'Dzovuni', ru: 'Дзовуни' },
Ազավնաձոր: { hy: 'Ազավնաձոր', en: 'Azavnadzor', ru: 'Азавнадзор' },
Արտավազ: { hy: 'Արտավազ', en: 'Artavaz', ru: 'Артаваз' },
Բուժական: { hy: 'Բուժական', en: 'Buzhakan', ru: 'Бужакан' },
Ֆանտան: { hy: 'Ֆանտան', en: 'Fantan', ru: 'Фантан' },
Գեղադիր: { hy: 'Գեղադիր', en: 'Gekhadir', ru: 'Гехадир' },
Գեղաշեն: { hy: 'Գեղաշեն', en: 'Gekhashen', ru: 'Гехашен' },
Գետարգել: { hy: 'Գետարգել', en: 'Getargel', ru: 'Гетаргел' },
Գոռգոչ: { hy: 'Գոռգոչ', en: 'Gorgoch', ru: 'Горгоч' },
Հանքավան: { hy: 'Հանքավան', en: 'Hankavan', ru: 'Ханкаван' },
Ջրառատ: { hy: 'Ջրառատ', en: 'Jrarat', ru: 'Джрарат' },
Ողջաբերդ: { hy: 'Ողջաբերդ', en: 'Voghjaberd', ru: 'Воджаберд' },
Զառ: { hy: 'Զառ', en: 'Zar', ru: 'Зар' },
Կարենիս: { hy: 'Կարենիս', en: 'Karenis', ru: 'Каренис' },
Հատիս: { hy: 'Հատիս', en: 'Hatis', ru: 'Хатис' },
Կապուտան: { hy: 'Կապուտան', en: 'Kaputan', ru: 'Капутан' },
Կաթնաղբյուր: { hy: 'Կաթնաղբյուր', en: 'Katnaghbyur', ru: 'Катнагбюр' },
Մարմարիկ: { hy: 'Մարմարիկ', en: 'Marmarik', ru: 'Мармарик' },
Մեղրաձոր: { hy: 'Մեղրաձոր', en: 'Meghradzor', ru: 'Меградзор' },
Լեռնանիստ: { hy: 'Լեռնանիստ', en: 'Lernanist', ru: 'Лернанист' },
Զովաշեն: { hy: 'Զովաշեն', en: 'Zovashen', ru: 'Зовашен' },
Սարալանջ: { hy: 'Սարալանջ', en: 'Saralanj', ru: 'Сараланж' },
Սևաբերդ: { hy: 'Սևաբերդ', en: 'Sevaberd', ru: 'Севаберд' },
Թեղենիք: { hy: 'Թեղենիք', en: 'Teghenik', ru: 'Тегеник' },
Քաղսի: { hy: 'Քաղսի', en: 'Kaghsi', ru: 'Кагхси' },
Հացավան: { hy: 'Հացավան', en: 'Hasavan', ru: 'Хасаван' },
Փյունիկ: { hy: 'Փյունիկ', en: 'Pyunik', ru: 'Пюник' },
Ջրաբեր: { hy: 'Ջրաբեր', en: 'Jraber', ru: 'Джрабер' },

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
