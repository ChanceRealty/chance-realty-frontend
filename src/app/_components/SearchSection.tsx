'use client'
import { useState, useEffect, useRef } from 'react'
import {
	PropertyType,
	ListingType,
	State,
	City,
	District,
	getBuildingTypeName,
	getBusinessTypeName,
} from '@/types/property'
import {
	getCitiesByState,
	getDistrictsByState,
	getStates,
	getTranslatedCityName,
	getTranslatedField,
	getTranslatedStateName,
	getApartmentBuildingTypes,
	getCommercialBusinessTypes,
} from '@/services/propertyService'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import {
	Search,
	Home,
	Building2,
	Landmark,
	Trees,
	MapPin,
	DollarSign,
	Bed,
	Bath,
	ChevronDown,
	X,
	SlidersHorizontal,
	Layers3,
	Maximize,
	KeyRound,
	Check,
} from 'lucide-react'
import { RxHeight } from 'react-icons/rx'

export default function CompactSearchHeader() {
	const t = useTranslations()
	const { language } = useLanguage()
	const [showAdvancedModal, setShowAdvancedModal] = useState(false)
	const [customId, setCustomId] = useState('')
	const [states, setStates] = useState<State[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [districts, setDistricts] = useState<District[]>([])
	const [buildingTypes, setBuildingTypes] = useState<any[]>([])
	const [businessTypes, setBusinessTypes] = useState<any[]>([])
	
	// Dropdown visibility states
	const [showStateDropdown, setShowStateDropdown] = useState(false)
	const [showCityDropdown, setShowCityDropdown] = useState(false)
	const [showDistrictDropdown, setShowDistrictDropdown] = useState(false)
	const [showBuildingTypeDropdown, setShowBuildingTypeDropdown] = useState(false)
	const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false)

	const modalRef = useRef<HTMLDivElement>(null)
	const stateDropdownRef = useRef<HTMLDivElement>(null)
	const cityDropdownRef = useRef<HTMLDivElement>(null)
	const districtDropdownRef = useRef<HTMLDivElement>(null)
	const buildingTypeDropdownRef = useRef<HTMLDivElement>(null)
	const businessTypeDropdownRef = useRef<HTMLDivElement>(null)

	const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | ''>('')
	
	
	const [advancedSearch, setAdvancedSearch] = useState({
		listing_type: '' as ListingType | '',
		location: '',
		min_price: '',
		max_price: '',
		bedrooms: '',
		bathrooms: '',
		min_area_sqft: '',
		max_area_sqft: '',
		state_ids: [] as number[],
		city_ids: [] as number[],
		district_ids: [] as number[],
		floors: '',
		floor: '',
		total_floors: '',
		ceiling_height: '',
		min_lot_size_sqft: '',
		max_lot_size_sqft: '',
		business_type_id: undefined as number | undefined,
		building_type_id: undefined as number | undefined,
		min_area_acres: '',
		max_area_acres: '',
		features: [] as number[],
	})

	useEffect(() => {
		const fetchStates = async () => {
			try {
				const statesData = await getStates()
				setStates(statesData || [])
			} catch (error) {
				console.error('Error fetching states:', error)
			}
		}
		
		const fetchBuildingTypes = async () => {
			try {
				const data = await getApartmentBuildingTypes()
				setBuildingTypes(data || [])
			} catch (error) {
				console.error('Error fetching building types:', error)
			}
		}

		const fetchBusinessTypes = async () => {
			try {
				const data = await getCommercialBusinessTypes()
				setBusinessTypes(data || [])
			} catch (error) {
				console.error('Error fetching business types:', error)
			}
		}

		fetchStates()
		fetchBuildingTypes()
		fetchBusinessTypes()
	}, [])

	useEffect(() => {
		if (advancedSearch.state_ids.length > 0) {
			const fetchLocationData = async () => {
				const allCities: City[] = []
				const allDistricts: District[] = []

				for (const stateId of advancedSearch.state_ids) {
					const state = states.find(s => s.id === stateId)
					if (state) {
						if (state.uses_districts) {
							const stateDistricts = await getDistrictsByState(stateId)
							allDistricts.push(...(stateDistricts || []))
						} else {
							const stateCities = await getCitiesByState(stateId)
							allCities.push(...(stateCities || []))
						}
					}
				}

				// Remove duplicates
				const uniqueCities = allCities.filter(
					(city, index, self) => index === self.findIndex(c => c.id === city.id)
				)
				const uniqueDistricts = allDistricts.filter(
					(district, index, self) => index === self.findIndex(d => d.id === district.id)
				)

				setCities(uniqueCities)
				setDistricts(uniqueDistricts)
			}

			fetchLocationData()
		} else {
			setCities([])
			setDistricts([])
		}
	}, [advancedSearch.state_ids, states])

	useEffect(() => {
		if (!showAdvancedModal) return

		const handleClickOutside = (event: MouseEvent) => {
			if (advancedButtonRef.current?.contains(event.target as Node)) {
				return
			}

			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				setShowAdvancedModal(false)
			}
		}

		const timeoutId = setTimeout(() => {
			document.addEventListener('mousedown', handleClickOutside)
		}, 100)

		document.body.style.overflow = 'hidden'

		return () => {
			clearTimeout(timeoutId)
			document.body.style.overflow = 'unset'
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showAdvancedModal])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
				setShowStateDropdown(false)
			}
			if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
				setShowCityDropdown(false)
			}
			if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
				setShowDistrictDropdown(false)
			}
			if (buildingTypeDropdownRef.current && !buildingTypeDropdownRef.current.contains(event.target as Node)) {
				setShowBuildingTypeDropdown(false)
			}
			if (businessTypeDropdownRef.current && !businessTypeDropdownRef.current.contains(event.target as Node)) {
				setShowBusinessTypeDropdown(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleSimpleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (customId.trim()) {
			window.location.href = `/${language}/properties/${customId.trim()}`
		}
	}

	const getAttributeLabel = (key: string) => {
		const labels: Record<string, Record<string, string>> = {
			bedrooms: { hy: 'Ննջարաններ', ru: 'Спальни', en: 'Bedrooms' },
			bathrooms: { hy: 'Լոգարաններ', ru: 'Ванные', en: 'Bathrooms' },
			min_area_sqft: { hy: 'Նվազագույն մակերես (մ²)', ru: 'Минимальная площадь (м²)', en: 'Min. Area (m²)' },
			max_area_sqft: { hy: 'Առավելագույն մակերես (մ²)', ru: 'Максимальная площадь (м²)', en: 'Max. Area (m²)' },
			min_lot_size_sqft: { hy: 'Նվազագույն հողատարածքի մակերես (մ²)', ru: 'Минимальный размер участка (м²)', en: 'Min. Lot Size (m²)' },
			max_lot_size_sqft: { hy: 'Առավելագույն հողատարածքի մակերես (մ²)', ru: 'Максимальный размер участка (м²)', en: 'Max. Lot Size (m²)' },
			floors: { hy: 'Հարկեր', ru: 'Этажи', en: 'Floors' },
			floor: { hy: 'Հարկ', ru: 'Этаж', en: 'Floor' },
			total_floors: { hy: 'Ընդհանուր հարկեր', ru: 'Всего этажей', en: 'Total Floors' },
			ceiling_height: { hy: 'Առաստաղի բարձրություն', ru: 'Высота потолка', en: 'Ceiling Height' },
			business_type: { hy: 'Բիզնեսի տեսակ', ru: 'Тип бизнеса', en: 'Business Type' },
			building_type: { hy: 'Շինության տիպ', ru: 'Тип здания', en: 'Building Type' },
			min_area_acres: { hy: 'Նվազագույն մակերես (մ²)', ru: 'Мин. Площадь (м²)', en: 'Min. Area (m²)' },
			max_area_acres: { hy: 'Առավելագույն մակերես (մ²)', ru: 'Максимальная площадь (м²)', en: 'Max. Area (m²)' },
		}
		return labels[key]?.[language] || key
	}

	const handleAdvancedSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const params = new URLSearchParams()

		if (selectedPropertyType) params.append('property_type', selectedPropertyType)
		if (advancedSearch.listing_type) params.append('listing_type', advancedSearch.listing_type)

		// Multi-select locations
		advancedSearch.state_ids.forEach(id => params.append('state_id', id.toString()))
		advancedSearch.city_ids.forEach(id => params.append('city_id', id.toString()))
		advancedSearch.district_ids.forEach(id => params.append('district_id', id.toString()))

		if (advancedSearch.min_price) params.append('min_price', advancedSearch.min_price)
		if (advancedSearch.max_price) params.append('max_price', advancedSearch.max_price)

		if (selectedPropertyType === 'house') {
			if (advancedSearch.bedrooms) params.append('bedrooms', advancedSearch.bedrooms)
			if (advancedSearch.bathrooms) params.append('bathrooms', advancedSearch.bathrooms)
			if (advancedSearch.floors) params.append('floors', advancedSearch.floors)
			if (advancedSearch.min_lot_size_sqft) params.append('min_lot_size_sqft', advancedSearch.min_lot_size_sqft)
			if (advancedSearch.max_lot_size_sqft) params.append('max_lot_size_sqft', advancedSearch.max_lot_size_sqft)
			if (advancedSearch.ceiling_height) params.append('ceiling_height', advancedSearch.ceiling_height)
			if (advancedSearch.min_area_sqft) params.append('min_area_sqft', advancedSearch.min_area_sqft)
			if (advancedSearch.max_area_sqft) params.append('max_area_sqft', advancedSearch.max_area_sqft)
		} else if (selectedPropertyType === 'apartment') {
			if (advancedSearch.bedrooms) params.append('bedrooms', advancedSearch.bedrooms)
			if (advancedSearch.bathrooms) params.append('bathrooms', advancedSearch.bathrooms)
			if (advancedSearch.floor) params.append('floor', advancedSearch.floor)
			if (advancedSearch.total_floors) params.append('total_floors', advancedSearch.total_floors)
			if (advancedSearch.ceiling_height) params.append('ceiling_height', advancedSearch.ceiling_height)
			if (advancedSearch.min_area_sqft) params.append('min_area_sqft', advancedSearch.min_area_sqft)
			if (advancedSearch.max_area_sqft) params.append('max_area_sqft', advancedSearch.max_area_sqft)
			if (advancedSearch.building_type_id) params.append('building_type_id', advancedSearch.building_type_id.toString())
		} else if (selectedPropertyType === 'commercial') {
			if (advancedSearch.business_type_id) params.append('business_type_id', advancedSearch.business_type_id.toString())
			if (advancedSearch.floors) params.append('floors', advancedSearch.floors)
			if (advancedSearch.ceiling_height) params.append('ceiling_height', advancedSearch.ceiling_height)
			if (advancedSearch.min_area_sqft) params.append('min_area_sqft', advancedSearch.min_area_sqft)
			if (advancedSearch.max_area_sqft) params.append('max_area_sqft', advancedSearch.max_area_sqft)
		} else if (selectedPropertyType === 'land') {
			if (advancedSearch.min_area_acres) params.append('min_area_acres', advancedSearch.min_area_acres)
			if (advancedSearch.max_area_acres) params.append('max_area_acres', advancedSearch.max_area_acres)
		} else {
			if (advancedSearch.bedrooms) params.append('bedrooms', advancedSearch.bedrooms)
			if (advancedSearch.bathrooms) params.append('bathrooms', advancedSearch.bathrooms)
			if (advancedSearch.min_area_sqft) params.append('min_area_sqft', advancedSearch.min_area_sqft)
			if (advancedSearch.max_area_sqft) params.append('max_area_sqft', advancedSearch.max_area_sqft)
		}

		if (advancedSearch.features.length > 0) {
			params.append('features', advancedSearch.features.join(','))
		}

		window.location.href = `/${language}/properties?${params.toString()}`
	}

	const advancedButtonRef = useRef<HTMLButtonElement>(null)

	const clearAdvancedSearch = () => {
		setSelectedPropertyType('')
		setAdvancedSearch({
			listing_type: '',
			location: '',
			min_price: '',
			max_price: '',
			bedrooms: '',
			bathrooms: '',
			min_area_sqft: '',
			max_area_sqft: '',
			state_ids: [],
			city_ids: [],
			district_ids: [],
			floors: '',
			floor: '',
			total_floors: '',
			ceiling_height: '',
			min_lot_size_sqft: '',
			max_lot_size_sqft: '',
			business_type_id: undefined,
			building_type_id: undefined,
			min_area_acres: '',
			max_area_acres: '',
			features: [],
		})
	}

	const toggleState = (stateId: number) => {
		setAdvancedSearch(prev => ({
			...prev,
			state_ids: prev.state_ids.includes(stateId)
				? prev.state_ids.filter(id => id !== stateId)
				: [...prev.state_ids, stateId],
			city_ids: [],
			district_ids: [],
		}))
	}

	const toggleCity = (cityId: number) => {
		setAdvancedSearch(prev => ({
			...prev,
			city_ids: prev.city_ids.includes(cityId)
				? prev.city_ids.filter(id => id !== cityId)
				: [...prev.city_ids, cityId],
		}))
	}

	const toggleDistrict = (districtId: number) => {
		setAdvancedSearch(prev => ({
			...prev,
			district_ids: prev.district_ids.includes(districtId)
				? prev.district_ids.filter(id => id !== districtId)
				: [...prev.district_ids, districtId],
		}))
	}

	const getTranslatedDistrictName = (
		district: unknown | string | Record<string, undefined>,
		language: string
	): string => {
		if (!district) return ''
		if (typeof district === 'string') return district
		if (district && typeof district === 'object' && 'name' in district) {
			return getTranslatedField(
				district as Record<string, undefined>,
				'name',
				language as 'hy' | 'en' | 'ru'
			)
		}
		if (typeof district === 'object' && district !== null) {
			const districtObj = district as Record<string, unknown>
			const langKey = `name_${language}` as keyof typeof districtObj
			if (langKey in districtObj && typeof districtObj[langKey] === 'string') {
				return districtObj[langKey] as string
			}
			if ('name' in districtObj && typeof districtObj.name === 'string') {
				return districtObj.name
			}
		}
		return ''
	}

	const propertyTypes = [
		{
			type: 'house' as PropertyType,
			icon: Home,
			label: t.house,
			color: 'blue',
			gradient: 'from-blue-500 to-blue-600',
			bgColor: 'bg-blue-100',
			hoverBgColor: 'group-hover:bg-blue-200',
			textColor: 'text-blue-600',
			borderColor: 'border-blue-400',
		},
		{
			type: 'apartment' as PropertyType,
			icon: Building2,
			label: t.apartment,
			color: 'emerald',
			gradient: 'from-emerald-500 to-emerald-600',
			bgColor: 'bg-emerald-100',
			hoverBgColor: 'group-hover:bg-emerald-200',
			textColor: 'text-emerald-600',
			borderColor: 'border-emerald-400',
		},
		{
			type: 'commercial' as PropertyType,
			icon: Landmark,
			label: t.commercial,
			color: 'violet',
			gradient: 'from-violet-500 to-violet-600',
			bgColor: 'bg-violet-100',
			hoverBgColor: 'group-hover:bg-violet-200',
			textColor: 'text-violet-600',
			borderColor: 'border-violet-400',
		},
		{
			type: 'land' as PropertyType,
			icon: Trees,
			label: t.land,
			color: 'amber',
			gradient: 'from-amber-500 to-amber-600',
			bgColor: 'bg-amber-100',
			hoverBgColor: 'group-hover:bg-amber-200',
			textColor: 'text-amber-600',
			borderColor: 'border-amber-400',
		},
	]

	const getPropertyTypeFields = () => {
		switch (selectedPropertyType) {
			case 'house':
				return (
					<>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('bedrooms')}
							</label>
							<div className='relative'>
								<Bed className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.bedrooms}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											bedrooms: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('bathrooms')}
							</label>
							<div className='relative'>
								<Bath className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.bathrooms}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											bathrooms: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('floors')}
							</label>
							<div className='relative'>
								<Layers3 className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.floors}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											floors: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='1'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('min_lot_size_sqft')}
							</label>

							<div className='grid grid-cols-2 gap-2'>
								<input
									type='number'
									placeholder={t.minArea}
									value={advancedSearch.min_lot_size_sqft}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											min_lot_size_sqft: e.target.value,
										})
									}
									className='w-full text-gray-600 px-3 py-3 md:py-4
				border-2 border-gray-200 rounded-xl text-sm
				focus:ring-2 focus:ring-blue-500 focus:border-blue-500
				hover:border-gray-300 transition-all bg-white shadow-sm'
									min='0'
								/>

								<input
									type='number'
									placeholder={t.maxArea}
									value={advancedSearch.max_lot_size_sqft}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											max_lot_size_sqft: e.target.value,
										})
									}
									className='w-full text-gray-600 px-3 py-3 md:py-4
				border-2 border-gray-200 rounded-xl text-sm
				focus:ring-2 focus:ring-blue-500 focus:border-blue-500
				hover:border-gray-300 transition-all bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('ceiling_height')}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.ceiling_height}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											ceiling_height: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>
					</>
				)

			case 'apartment':
				return (
					<>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('bedrooms')}
							</label>
							<div className='relative'>
								<Bed className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.bedrooms}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											bedrooms: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('bathrooms')}
							</label>
							<div className='relative'>
								<Bath className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.bathrooms}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											bathrooms: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('floor')}
							</label>
							<div className='relative'>
								<Layers3 className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.floor}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											floor: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='1'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('total_floors')}
							</label>
							<div className='relative'>
								<Layers3 className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.total_floors}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											total_floors: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='1'
								/>
							</div>
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('ceiling_height')}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.ceiling_height}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											ceiling_height: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>

						{/* Building Type Dropdown */}
						<div className='relative' ref={buildingTypeDropdownRef}>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('building_type')}
							</label>
							<button
								type='button'
								onClick={() => setShowBuildingTypeDropdown(!showBuildingTypeDropdown)}
								className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50'
							>
								<span className='text-gray-700'>
									{advancedSearch.building_type_id
										? getBuildingTypeName(
												buildingTypes.find(b => b.id === advancedSearch.building_type_id),
												language
										  )
										: t.any}
								</span>
								<ChevronDown className='w-4 h-4 text-gray-400' />
							</button>

							{showBuildingTypeDropdown && (
								<div className='absolute z-50 mt-2 w-full text-gray-600 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto'>
									<button
										onClick={() => {
											setAdvancedSearch({ ...advancedSearch, building_type_id: undefined })
											setShowBuildingTypeDropdown(false)
										}}
										className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100'
									>
										{t.any}
									</button>
									{buildingTypes.map(type => (
										<button
											key={type.id}
											onClick={() => {
												setAdvancedSearch({ ...advancedSearch, building_type_id: type.id })
												setShowBuildingTypeDropdown(false)
											}}
											className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100'
										>
											{getBuildingTypeName(type, language)}
										</button>
									))}
								</div>
							)}
						</div>
					</>
				)

			case 'commercial':
				return (
					<>
						{/* Business Type Dropdown */}
						<div className='relative group' ref={businessTypeDropdownRef}>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('business_type')}
							</label>
							<button
								type='button'
								onClick={() => setShowBusinessTypeDropdown(!showBusinessTypeDropdown)}
								className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50'
							>
								<span className='text-gray-700'>
									{advancedSearch.business_type_id
										? getBusinessTypeName(
												businessTypes.find(b => b.id === advancedSearch.business_type_id),
												language
										  )
										: t.any}
								</span>
								<ChevronDown className='w-4 h-4 text-gray-400' />
							</button>

							{showBusinessTypeDropdown && (
								<div className='absolute z-50 mt-2 w-full text-gray-600 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto'>
									<button
										onClick={() => {
											setAdvancedSearch({ ...advancedSearch, business_type_id: undefined })
											setShowBusinessTypeDropdown(false)
										}}
										className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100'
									>
										{t.any}
									</button>
									{businessTypes.map(type => (
										<button
											key={type.id}
											onClick={() => {
												setAdvancedSearch({ ...advancedSearch, business_type_id: type.id })
												setShowBusinessTypeDropdown(false)
											}}
											className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100'
										>
											{getBusinessTypeName(type, language)}
										</button>
									))}
								</div>
							)}
						</div>

						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('ceiling_height')}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.ceiling_height}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											ceiling_height: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>
					</>
				)

			case 'land':
				return (
					<>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								{getAttributeLabel('min_area_acres')}
							</label>

							<div className='grid grid-cols-2 gap-2'>
								<input
									type='number'
									placeholder={t.minArea}
									value={advancedSearch.min_area_acres}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											min_area_acres: e.target.value,
										})
									}
									className='w-full px-3 py-2.5 text-gray-600 border-2 border-gray-200 rounded-lg text-sm'
								/>

								<input
									type='number'
									placeholder={t.maxArea}
									value={advancedSearch.max_area_acres}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											max_area_acres: e.target.value,
										})
									}
									className='w-full px-3 py-2.5 text-gray-600 border-2 border-gray-200 rounded-lg text-sm'
								/>
							</div>
						</div>
					</>
				)

			default:
				return null
		}
	}

	return (
		<>
			{/* Compact Header Search */}
			<div className='flex items-center gap-2'>
				<form onSubmit={handleSimpleSearch} className='flex items-center gap-2'>
					<div className='relative'>
						<input
							type='text'
							placeholder={t.searchPlaceholder}
							value={customId}
							onChange={e => setCustomId(e.target.value)}
							className='w-42 sm:w-48 pl-2 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 hover:border-gray-300 transition-all duration-200'
						/>
					</div>
					<button
						type='submit'
						className='bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-3 sm:px-4 py-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium'
					>
						<Search className='w-4 h-4' />
					</button>
				</form>

				<button
					ref={advancedButtonRef}
					onClick={() => setShowAdvancedModal(true)}
					className='flex items-center gap-2 px-3 sm:px-3 py-2 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium'
				>
					<SlidersHorizontal width={20} height={20} />
				</button>
			</div>

			{/* Advanced Search Modal */}
			{showAdvancedModal && (
				<div className='fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
					<div
						ref={modalRef}
						className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto'
					>
						{/* Modal Header */}
						<div className='flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50'>
							<div className='flex items-center gap-2 sm:gap-3'>
								<div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
									<SlidersHorizontal className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
								</div>
								<div>
									<h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
										{t.advancedSearch}
									</h2>
								</div>
							</div>
							<button
								onClick={() => setShowAdvancedModal(false)}
								className='p-2 hover:bg-white rounded-lg transition-colors'
							>
								<X className='w-5 h-5 sm:w-6 sm:h-6 text-gray-500' />
							</button>
						</div>

						{/* Modal Content */}
						<div className='overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)] p-4 sm:p-6'>
							{/* Property Type Selection */}
							<div className='mb-6 sm:mb-8'>
								<div className='flex items-center justify-between mb-4 sm:mb-6'>
									<label className='text-base sm:text-lg font-semibold text-gray-800'>
										{t.selectPropertyType}
									</label>
									{(selectedPropertyType ||
										advancedSearch.listing_type ||
										advancedSearch.min_price ||
										advancedSearch.max_price) && (
										<button
											onClick={clearAdvancedSearch}
											className='inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium'
										>
											<X className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
											<span className='hidden sm:inline cursor-pointer'>
												{t.clearAll}
											</span>
										</button>
									)}
								</div>
								<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
									{propertyTypes.map(
										({
											type,
											icon: Icon,
											label,
											gradient,
											bgColor,
											hoverBgColor,
											textColor,
											borderColor,
										}) => (
											<button
												key={type}
												type='button'
												onClick={() =>
													setSelectedPropertyType(
														selectedPropertyType === type ? '' : type
													)
												}
												className={`group cursor-pointer relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
													selectedPropertyType === type
														? `${borderColor} bg-gradient-to-br ${gradient} text-white shadow-xl scale-105`
														: 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
												}`}
											>
												<div
													className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 transition-all duration-300 ${
														selectedPropertyType === type
															? 'bg-white/20 backdrop-blur-sm'
															: `${bgColor} ${hoverBgColor}`
													}`}
												>
													<Icon
														className={`w-5 h-5 sm:w-7 sm:h-7 transition-all duration-300 ${
															selectedPropertyType === type
																? 'text-white'
																: textColor
														}`}
													/>
												</div>
												<span
													className={`text-xs sm:text-sm font-semibold block transition-colors ${
														selectedPropertyType === type
															? 'text-white'
															: 'text-gray-700'
													}`}
												>
													{label}
												</span>
											</button>
										)
									)}
								</div>
							</div>

							<form onSubmit={handleAdvancedSearch}>
								<div className='bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6'>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
										{/* Listing Type */}
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.listingType}
											</label>
											<div className='relative'>
												<KeyRound className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
												<select
													value={advancedSearch.listing_type}
													onChange={e =>
														setAdvancedSearch({
															...advancedSearch,
															listing_type: e.target.value as ListingType | '',
														})
													}
													className='w-full text-gray-600 pl-10 md:pl-12 pr-8 md:pr-10 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer'
												>
													<option value=''>{t.anyType}</option>
													<option value='sale'>{t.forSale}</option>
													<option value='rent'>{t.forRent}</option>
													<option value='daily_rent'>{t.forDailyRent}</option>
												</select>
												<ChevronDown className='absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none' />
											</div>
										</div>

										{/* States Multi-Select */}
										<div className='relative' ref={stateDropdownRef}>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.location}
											</label>
											<button
												type='button'
												onClick={() => setShowStateDropdown(!showStateDropdown)}
												className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
											>
												<div className='flex items-center gap-2'>
													<MapPin className='w-4 h-4 text-gray-600' />
													<span className='text-gray-600'>
														{advancedSearch.state_ids.length > 0
															? `${advancedSearch.state_ids.length} ${
																	language === 'hy'
																		? 'նահանգ'
																		: language === 'ru'
																		? 'регионов'
																		: 'states'
															  }`
															: t.allStates}
													</span>
												</div>
												<ChevronDown className='w-4 h-4 text-gray-400' />
											</button>

											{showStateDropdown && (
												<div className='absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
													{states.map(state => (
														<label
															key={state.id}
															className='flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors'
														>
															<div className='relative flex items-center'>
																<input
																	type='checkbox'
																	checked={advancedSearch.state_ids.includes(
																		state.id
																	)}
																	onChange={() => toggleState(state.id)}
																	className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
																/>
																{advancedSearch.state_ids.includes(
																	state.id
																) && (
																	<Check className='w-3 h-3 absolute left-0.5 pointer-events-none' />
																)}
															</div>
															<span className='ml-3 text-sm text-gray-700'>
																{getTranslatedStateName(state.name, language)}
															</span>
														</label>
													))}
												</div>
											)}
										</div>

										{/* Districts Multi-Select */}
										{districts.length > 0 && (
											<div className='relative' ref={districtDropdownRef}>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.district}
												</label>
												<button
													type='button'
													onClick={() =>
														setShowDistrictDropdown(!showDistrictDropdown)
													}
													className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
												>
													<div className='flex items-center gap-2'>
														<Building2 className='w-4 h-4 text-gray-600' />
														<span className='text-gray-600'>
															{advancedSearch.district_ids.length > 0
																? `${advancedSearch.district_ids.length} ${
																		language === 'hy'
																			? 'շրջան'
																			: language === 'ru'
																			? 'районов'
																			: 'districts'
																  }`
																: t.allDistricts}
														</span>
													</div>
													<ChevronDown className='w-4 h-4 text-gray-400' />
												</button>

												{showDistrictDropdown && (
													<div className='absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
														{districts.map(district => (
															<label
																key={district.id}
																className='flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors'
															>
																<div className='relative flex items-center'>
																	<input
																		type='checkbox'
																		checked={advancedSearch.district_ids.includes(
																			district.id
																		)}
																		onChange={() => toggleDistrict(district.id)}
																		className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
																	/>
																	{advancedSearch.district_ids.includes(
																		district.id
																	) && (
																		<Check className='w-3 h-3 absolute left-0.5 pointer-events-none' />
																	)}
																</div>
																<span className='ml-3 text-sm text-gray-700'>
																	{getTranslatedDistrictName(
																		district,
																		language
																	)}
																</span>
															</label>
														))}
													</div>
												)}
											</div>
										)}

										{/* Cities Multi-Select */}
										{cities.length > 0 && (
											<div className='relative' ref={cityDropdownRef}>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.city}
												</label>
												<button
													type='button'
													onClick={() => setShowCityDropdown(!showCityDropdown)}
													className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
												>
													<div className='flex items-center gap-2'>
														<Building2 className='w-4 h-4 text-gray-600' />
														<span className='text-gray-600'>
															{advancedSearch.city_ids.length > 0
																? `${advancedSearch.city_ids.length} ${
																		language === 'hy'
																			? 'քաղաք'
																			: language === 'ru'
																			? 'городов'
																			: 'cities'
																  }`
																: t.allCities}
														</span>
													</div>
													<ChevronDown className='w-4 h-4 text-gray-400' />
												</button>

												{showCityDropdown && (
													<div className='absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
														{cities.map(city => (
															<label
																key={city.id}
																className='flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors'
															>
																<div className='relative flex items-center'>
																	<input
																		type='checkbox'
																		checked={advancedSearch.city_ids.includes(
																			city.id
																		)}
																		onChange={() => toggleCity(city.id)}
																		className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
																	/>
																	{advancedSearch.city_ids.includes(
																		city.id
																	) && (
																		<Check className='w-3 h-3 absolute left-0.5 pointer-events-none' />
																	)}
																</div>
																<span className='ml-3 text-sm text-gray-700'>
																	{getTranslatedCityName(city.name, language)}
																</span>
															</label>
														))}
													</div>
												)}
											</div>
										)}

										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2'>
												{t.priceRange}
											</label>

											<div className='grid grid-cols-2 gap-2'>
												<input
													type='number'
													placeholder={t.minPrice}
													value={advancedSearch.min_price}
													onChange={e =>
														setAdvancedSearch({
															...advancedSearch,
															min_price: e.target.value,
														})
													}
													className='w-full px-3 text-gray-600 py-2.5 border-2 border-gray-200 rounded-lg text-sm'
												/>

												<input
													type='number'
													placeholder={t.maxPrice}
													value={advancedSearch.max_price}
													onChange={e =>
														setAdvancedSearch({
															...advancedSearch,
															max_price: e.target.value,
														})
													}
													className='w-full px-3 py-2.5 text-gray-600 border-2 border-gray-200 rounded-lg text-sm'
												/>
											</div>
										</div>

										{/* Area fields */}
										{(selectedPropertyType === 'house' ||
											selectedPropertyType === 'apartment' ||
											selectedPropertyType === 'commercial' ||
											!selectedPropertyType) && (
											<>
												<div className='relative group'>
													<label className='block text-sm font-semibold text-gray-700 mb-2'>
														{getAttributeLabel('min_area_sqft')}
													</label>

													<div className='grid grid-cols-2 gap-2'>
														<input
															type='number'
															placeholder={t.minArea}
															value={advancedSearch.min_area_sqft}
															onChange={e =>
																setAdvancedSearch({
																	...advancedSearch,
																	min_area_sqft: e.target.value,
																})
															}
															className='w-full px-3 py-2.5 text-gray-600 border-2 border-gray-200 rounded-lg text-sm'
														/>

														<input
															type='number'
															placeholder={t.maxArea}
															value={advancedSearch.max_area_sqft}
															onChange={e =>
																setAdvancedSearch({
																	...advancedSearch,
																	max_area_sqft: e.target.value,
																})
															}
															className='w-full px-3 text-gray-600 py-2.5 border-2 border-gray-200 rounded-lg text-sm'
														/>
													</div>
												</div>
											</>
										)}

										{/* Property type specific fields */}
										{getPropertyTypeFields()}
									</div>
								</div>

								<div className='flex flex-col sm:flex-row gap-3'>
									<button
										type='submit'
										className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 sm:px-8 py-3 sm:py-4 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5'
									>
										<Search className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
										<span className='text-sm sm:text-base'>
											{t.search} {t.properties}
										</span>
									</button>
									<button
										type='button'
										onClick={clearAdvancedSearch}
										className='sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-all duration-200 flex items-center justify-center font-semibold border-2 border-gray-200 hover:border-gray-300'
									>
										<X className='w-4 h-4 sm:w-5 sm:h-5 sm:mr-0' />
										<span className='ml-2 sm:hidden'>{t.clear}</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</>
	)
}