'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
	PropertyFilter as FilterType,
	PropertyType,
	ListingType,
	State,
	City,
	District,
	PropertyFeature,
	getBusinessTypeName,
	getBuildingTypeName,
} from '@/types/property'
import {
	getStates,
	getCitiesByState,
	getDistrictsByState,
	getPropertyFeatures,
	getTranslatedField,
	getTranslatedCityName,
	getTranslatedStateName,
	getApartmentBuildingTypes,
	getCommercialBusinessTypes,
} from '@/services/propertyService'
import {
	Home,
	Building2,
	Landmark,
	Trees,
	DollarSign,
	MapPin,
	Bed,
	Bath,
	Search,
	X,
	ChevronDown,
	KeyRound,
	Layers3,
	Maximize,
	Check,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import { RxHeight } from 'react-icons/rx'

interface PropertyFilterProps {
	onFilterChange: (filter: FilterType) => void
	initialFilter?: FilterType
}

	const FilterSection = ({
		title,
		icon: Icon,
		children,
		badge,
	}: {
		title: string
		icon: React.ComponentType<{ className?: string }>
		children: React.ReactNode
		badge?: number | string
	}) => (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible'>
			<button className='w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'>
				<div className='flex items-center'>
					<div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3'>
						<Icon className='w-4 h-4 text-white' />
					</div>
					<span className='font-semibold text-[14px] text-gray-900'>
						{title}
					</span>
					{badge && (
						<span className='ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full'>
							{badge}
						</span>
					)}
				</div>
			</button>

			<div className='transition-all duration-300 ease-in-out max-h-96 opacity-100'>
				<div className='p-4 pt-0 border-t border-gray-50'>{children}</div>
			</div>
		</div>
	)


export default function PropertyFilter({
	onFilterChange,
	initialFilter = {},
}: PropertyFilterProps) {
	const { language } = useLanguage()
	const t = useTranslations()
	const [states, setStates] = useState<State[]>([])
	const [districts, setDistricts] = useState<District[]>([])
	const [selectedState, setSelectedState] = useState<State | null>(null)
	const [cities, setCities] = useState<City[]>([])
	const [features, setFeatures] = useState<PropertyFeature[]>([])
	const [showStateDropdown, setShowStateDropdown] = useState(false)
	const [showCityDropdown, setShowCityDropdown] = useState(false)
	const [showDistrictDropdown, setShowDistrictDropdown] = useState(false)
	const stateDropdownRef = useRef<HTMLDivElement>(null)
	const cityDropdownRef = useRef<HTMLDivElement>(null)
	const districtDropdownRef = useRef<HTMLDivElement>(null)
	// Local filter state - doesn't trigger parent updates
	const [localFilter, setLocalFilter] = useState<FilterType>({
		...initialFilter,
		property_type: initialFilter.property_type as PropertyType | undefined,
	})
	const [buildingTypes, setBuildingTypes] = useState<any[]>([])
	const [businessTypes, setBusinessTypes] = useState<any[]>([])
	// Separate state for price inputs (strings for better UX)
	const [localPrices, setLocalPrices] = useState({
		min: localFilter.min_price?.toString() || '',
		max: localFilter.max_price?.toString() || '',
	})
	const [showBuildingTypeDropdown, setShowBuildingTypeDropdown] =
		useState(false)
	const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] =
		useState(false)

	const buildingTypeDropdownRef = useRef<HTMLDivElement>(null)
	const businessTypeDropdownRef = useRef<HTMLDivElement>(null)


	// Debounce function
	const debounce = useCallback(
		(func: (...args: unknown[]) => void, delay: number) => {
			let timeoutId: NodeJS.Timeout
			return (...args: unknown[]) => {
				clearTimeout(timeoutId)
				timeoutId = setTimeout(() => func(...args), delay)
			}
		},
		[]
	)

	// Debounced price update - only triggers after user stops typing
	const debouncedPriceUpdate = useCallback(
		debounce((minPrice: string, maxPrice: string) => {
			const newFilter = { ...localFilter }
			newFilter.min_price = minPrice ? parseFloat(minPrice) : undefined
			newFilter.max_price = maxPrice ? parseFloat(maxPrice) : undefined
			setLocalFilter(newFilter)
		}, 800), // Wait 800ms after user stops typing
		[localFilter]
	)

	// Handle price input changes without triggering parent
	const handlePriceChange = useCallback(
		(type: 'min' | 'max', value: string) => {
			// Only allow numbers and empty string
			if (value === '' || /^\d+$/.test(value)) {
				setLocalPrices(prev => ({
					...prev,
					[type]: value,
				}))

				// Trigger debounced update
				if (type === 'min') {
					debouncedPriceUpdate(value, localPrices.max)
				} else {
					debouncedPriceUpdate(localPrices.min, value)
				}
			}
		},
		[localPrices.max, localPrices.min, debouncedPriceUpdate]
	)

	useEffect(() => {
		fetchStates()
		fetchFeatures()
		fetchBuildingTypes()
		fetchBusinessTypes()
	}, [])

	useEffect(() => {
		const selectedStateIds = getSelectedStateIds()

		if (selectedStateIds.length > 0) {
			// Fetch cities/districts for all selected states
			const fetchLocationData = async () => {
				const allCities: City[] = []
				const allDistricts: District[] = []
				let usesDistricts = false

				for (const stateId of selectedStateIds) {
					const state = states.find(s => s.id === stateId)
					if (state) {
						if (state.uses_districts) {
							usesDistricts = true
							const stateDistricts = await getDistrictsByState(stateId)
							allDistricts.push(...(stateDistricts || []))
						} else {
							const stateCities = await getCitiesByState(stateId)
							allCities.push(...(stateCities || []))
						}
					}
				}

				// Remove duplicates by id
				const uniqueCities = allCities.filter(
					(city, index, self) => index === self.findIndex(c => c.id === city.id)
				)
				const uniqueDistricts = allDistricts.filter(
					(district, index, self) =>
						index === self.findIndex(d => d.id === district.id)
				)

				setCities(uniqueCities)
				setDistricts(uniqueDistricts)
			}

			fetchLocationData()
		} else {
			setCities([])
			setDistricts([])
		}
	}, [localFilter.state_id, states])

useEffect(() => {
	const handleClickOutside = (event: MouseEvent) => {
		if (
			stateDropdownRef.current &&
			!stateDropdownRef.current.contains(event.target as Node)
		) {
			setShowStateDropdown(false)
		}
		if (
			cityDropdownRef.current &&
			!cityDropdownRef.current.contains(event.target as Node)
		) {
			setShowCityDropdown(false)
		}
		if (
			districtDropdownRef.current &&
			!districtDropdownRef.current.contains(event.target as Node)
		) {
			setShowDistrictDropdown(false)
		}
		if (
			buildingTypeDropdownRef.current &&
			!buildingTypeDropdownRef.current.contains(event.target as Node)
		) {
			setShowBuildingTypeDropdown(false)
		}
		if (
			businessTypeDropdownRef.current &&
			!businessTypeDropdownRef.current.contains(event.target as Node)
		) {
			setShowBusinessTypeDropdown(false)
		}
	}

	document.addEventListener('mousedown', handleClickOutside)
	return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

	const fetchStates = async () => {
		try {
			const data = await getStates()
			setStates(data || [])
		} catch (error) {
			console.error('Error fetching states:', error)
			setStates([])
		}
	}

	const fetchBuildingTypes = async () => {
		try {
			// Replace with your actual API endpoint
			const data = await getApartmentBuildingTypes()
			setBuildingTypes(data || [])
		} catch (error) {
			console.error('Error fetching building types:', error)
			setBuildingTypes([])
		}
	}

	const fetchBusinessTypes = async () => {
		try {
			// Replace with your actual API endpoint
			const data = await getCommercialBusinessTypes()
			setBusinessTypes(data || [])
		} catch (error) {
			console.error('Error fetching business types:', error)
			setBusinessTypes([])
		}
	}

	const fetchCities = async (stateId: number) => {
		try {
			const data = await getCitiesByState(stateId)
			setCities(data || [])
		} catch (error) {
			console.error('Error fetching cities:', error)
			setCities([])
		}
	}

	const fetchDistricts = async (stateId: number) => {
		try {
			const data = await getDistrictsByState(stateId)
			setDistricts(data || [])
		} catch (error) {
			console.error('Error fetching districts:', error)
			setDistricts([])
		}
	}

	const fetchFeatures = async () => {
		try {
			const data = await getPropertyFeatures()
			setFeatures(data || [])
		} catch (error) {
			console.error('Error fetching features:', error)
			setFeatures([])
		}
	}
	// Helper functions for multi-select
	const getSelectedStateIds = (): number[] => {
		if (!localFilter.state_id) return []
		return Array.isArray(localFilter.state_id)
			? localFilter.state_id
			: [localFilter.state_id]
	}

	const getSelectedCityIds = (): number[] => {
		if (!localFilter.city_id) return []
		return Array.isArray(localFilter.city_id)
			? localFilter.city_id
			: [localFilter.city_id]
	}

	const getSelectedDistrictIds = (): number[] => {
		if (!localFilter.district_id) return []
		return Array.isArray(localFilter.district_id)
			? localFilter.district_id
			: [localFilter.district_id]
	}

	const toggleState = (stateId: number) => {
		const currentIds = getSelectedStateIds()
		const newIds = currentIds.includes(stateId)
			? currentIds.filter(id => id !== stateId)
			: [...currentIds, stateId]

		handleFilterChange('state_id', newIds.length > 0 ? newIds : undefined)
	}

	const toggleCity = (cityId: number) => {
		const currentIds = getSelectedCityIds()
		const newIds = currentIds.includes(cityId)
			? currentIds.filter(id => id !== cityId)
			: [...currentIds, cityId]

		handleFilterChange('city_id', newIds.length > 0 ? newIds : undefined)
	}

	const toggleDistrict = (districtId: number) => {
		const currentIds = getSelectedDistrictIds()
		const newIds = currentIds.includes(districtId)
			? currentIds.filter(id => id !== districtId)
			: [...currentIds, districtId]

		handleFilterChange('district_id', newIds.length > 0 ? newIds : undefined)
	}

	// Update local filter WITHOUT triggering parent
	const handleFilterChange = (
		key: keyof FilterType,
		value: PropertyType | ListingType | string | number | number[] | undefined
	) => {
		const newFilter: FilterType = { ...localFilter, [key]: value }

		if (key === 'state_id') {
			newFilter.city_id = undefined
			newFilter.district_id = undefined
		}

		// Reset property-specific attributes when property type changes
		if (key === 'property_type') {
			newFilter.bedrooms = undefined
			newFilter.bathrooms = undefined
			newFilter.floors = undefined
			newFilter.floor = undefined
			newFilter.total_floors = undefined
			newFilter.ceiling_height = undefined
			newFilter.min_lot_size_sqft = undefined
			newFilter.max_lot_size_sqft = undefined
			newFilter.business_type_id = undefined
			newFilter.building_type_id = undefined
			newFilter.min_area_acres = undefined
			newFilter.max_area_acres = undefined
			newFilter.min_area_sqft = undefined
			newFilter.max_area_sqft = undefined
		}

		setLocalFilter(newFilter)
	}

	// Only trigger parent update when user clicks "Apply Filters"
	const applyFilters = () => {
		onFilterChange(localFilter)
	}

	const clearFilter = () => {
		const clearedFilter: FilterType = { page: 1, limit: 12 }
		setLocalFilter(clearedFilter)
		setLocalPrices({ min: '', max: '' })
		onFilterChange(clearedFilter)
	}

	const hasActiveFilters = () => {
		return Object.keys(localFilter).some(
			key =>
				key !== 'page' &&
				key !== 'limit' &&
				localFilter[key as keyof FilterType]
		)
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
		if (
			typeof district === 'object' &&
			district !== null &&
			'name' in district
		) {
			return (district as { name?: string }).name || ''
		}
		return ''
	}

	const propertyTypes: {
		type: PropertyType
		icon: React.ComponentType<{ className?: string }>
		label: string
		color: string
	}[] = [
		{ type: 'house' as const, icon: Home, label: t.house, color: 'blue' },
		{
			type: 'apartment' as const,
			icon: Building2,
			label: t.apartment,
			color: 'blue',
		},
		{
			type: 'commercial' as const,
			icon: Landmark,
			label: t.commercial,
			color: 'blue',
		},
		{ type: 'land' as const, icon: Trees, label: t.land, color: 'blue' },
	]

	const listingTypes: {
		type: ListingType
		label: string
		color: string
		icon: string
	}[] = [
		{ type: 'sale', label: t.forSale, color: 'blue', icon: '🏠' },
		{ type: 'rent', label: t.forRent, color: 'blue', icon: '🔑' },
		{ type: 'daily_rent', label: t.forDailyRent, color: 'blue', icon: '📅' },
	]

	const isPropertyType = (type: PropertyType): boolean => {
		return localFilter.property_type === type
	}

	// Render property-specific fields based on selected type
	const renderPropertySpecificFields = () => {
		if (!localFilter.property_type) return null

		switch (localFilter.property_type) {
			case 'house':
				return (
					<>
						{/* Bedrooms & Bathrooms */}
						<div className='grid grid-cols-2 gap-2'>
							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{t.minBedrooms}
								</label>
								<div className='relative'>
									<Bed className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.bedrooms || ''}
										onChange={e =>
											handleFilterChange(
												'bedrooms',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='0'
									/>
								</div>
							</div>

							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{t.minBathrooms}
								</label>
								<div className='relative'>
									<Bath className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.bathrooms || ''}
										onChange={e =>
											handleFilterChange(
												'bathrooms',
												e.target.value ? parseFloat(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='0'
										step='0.5'
									/>
								</div>
							</div>
						</div>

						{/* Area */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Մակերես (մ²)'
									: language === 'ru'
									? 'Площадь (м²)'
									: 'Area (m²)'}
							</label>
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.startFiltering}
										value={localFilter.min_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'min_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.endFiltering}
										value={localFilter.max_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'max_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
							</div>
						</div>

						{/* Floors */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Հարկեր'
									: language === 'ru'
									? 'Этажи'
									: 'Floors'}
							</label>
							<div className='relative'>
								<Layers3 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='number'
									placeholder={t.any}
									value={localFilter.floors || ''}
									onChange={e =>
										handleFilterChange(
											'floors',
											e.target.value ? parseInt(e.target.value) : undefined
										)
									}
									className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
									min='1'
								/>
							</div>
						</div>

						{/* Lot Size */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Հողատարածքի մակերես (մ²)'
									: language === 'ru'
									? 'Площадь участка (м²)'
									: 'Lot Size (m²)'}
							</label>
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<Trees className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.startFiltering}
										value={localFilter.min_lot_size_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'min_lot_size_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
								<div className='relative flex-1'>
									<Trees className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.endFiltering}
										value={localFilter.max_lot_size_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'max_lot_size_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
							</div>
						</div>

						{/* Ceiling Height */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Առաստաղի բարձրություն (մ)'
									: language === 'ru'
									? 'Высота потолка (м)'
									: 'Ceiling Height (m)'}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='number'
									placeholder={t.any}
									value={localFilter.ceiling_height || ''}
									onChange={e =>
										handleFilterChange(
											'ceiling_height',
											e.target.value ? parseFloat(e.target.value) : undefined
										)
									}
									className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
									min='2'
									max='6'
									step='0.1'
								/>
							</div>
						</div>
					</>
				)

			case 'apartment':
				return (
					<>
						{/* Bedrooms & Bathrooms */}
						<div className='grid grid-cols-2 gap-2'>
							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{t.minBedrooms}
								</label>
								<div className='relative'>
									<Bed className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.bedrooms || ''}
										onChange={e =>
											handleFilterChange(
												'bedrooms',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='0'
									/>
								</div>
							</div>

							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{t.minBathrooms}
								</label>
								<div className='relative'>
									<Bath className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.bathrooms || ''}
										onChange={e =>
											handleFilterChange(
												'bathrooms',
												e.target.value ? parseFloat(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='0'
										step='0.5'
									/>
								</div>
							</div>
						</div>

						{/* Area */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Մակերես (մ²)'
									: language === 'ru'
									? 'Площадь (м²)'
									: 'Area (m²)'}
							</label>
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.startFiltering}
										value={localFilter.min_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'min_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.endFiltering}
										value={localFilter.max_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'max_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
							</div>
						</div>

						{/* Floor & Total Floors */}
						<div className='grid grid-cols-2 gap-2 mt-2'>
							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{language === 'hy'
										? 'Հարկ'
										: language === 'ru'
										? 'Этаж'
										: 'Floor'}
								</label>
								<div className='relative'>
									<Layers3 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.floor || ''}
										onChange={e =>
											handleFilterChange(
												'floor',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='1'
									/>
								</div>
							</div>

							<div className='relative'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{language === 'hy'
										? 'Ընդ. հարկեր'
										: language === 'ru'
										? 'Всего этажей'
										: 'Total Floors'}
								</label>
								<div className='relative'>
									<Layers3 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.any}
										value={localFilter.total_floors || ''}
										onChange={e =>
											handleFilterChange(
												'total_floors',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
										min='1'
									/>
								</div>
							</div>
						</div>

						{/* Ceiling Height */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Առաստաղի բարձրություն (մ)'
									: language === 'ru'
									? 'Высота потолка (м)'
									: 'Ceiling Height (m)'}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='number'
									placeholder={t.any}
									value={localFilter.ceiling_height || ''}
									onChange={e =>
										handleFilterChange(
											'ceiling_height',
											e.target.value ? parseFloat(e.target.value) : undefined
										)
									}
									className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
									min='2'
									max='6'
									step='0.1'
								/>
							</div>
						</div>
						<div className='relative mt-2' ref={buildingTypeDropdownRef}>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Շինության տիպ'
									: language === 'ru'
									? 'Тип здания'
									: 'Building Type'}
							</label>

							<button
								type='button'
								onClick={() => setShowBuildingTypeDropdown(prev => !prev)}
								className='w-full flex items-center justify-between px-4 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50'
							>
								<span className='text-gray-700'>
									{localFilter.building_type_id
										? getBuildingTypeName(
												buildingTypes.find(
													b => b.id === localFilter.building_type_id
												),
												language
										  )
										: language === 'hy'
										? 'Ընտրել'
										: language === 'ru'
										? 'Выбрать'
										: 'Select'}
								</span>
								<ChevronDown className='w-4 h-4 text-gray-400' />
							</button>

							{showBuildingTypeDropdown && (
								<div className='absolute z-50 mt-2 w-full text-gray-600 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto'>
									{buildingTypes.map(type => (
										<button
											key={type.id}
											onClick={() => {
												handleFilterChange('building_type_id', type.id)
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
						{/* Area */}
						<div className='relative'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Մակերես (մ²)'
									: language === 'ru'
									? 'Площадь (м²)'
									: 'Area (m²)'}
							</label>
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.startFiltering}
										value={localFilter.min_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'min_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
								<div className='relative flex-1'>
									<Maximize className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.endFiltering}
										value={localFilter.max_area_sqft || ''}
										onChange={e =>
											handleFilterChange(
												'max_area_sqft',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
									/>
								</div>
							</div>
						</div>
						<div className='relative mt-2' ref={businessTypeDropdownRef}>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Բիզնեսի տեսակ'
									: language === 'ru'
									? 'Тип бизнеса'
									: 'Business Type'}
							</label>

							<button
								type='button'
								onClick={() => setShowBusinessTypeDropdown(prev => !prev)}
								className='w-full flex items-center justify-between px-4 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50'
							>
								<span className='text-gray-700'>
									{localFilter.business_type_id
										? getBusinessTypeName(
												businessTypes.find(
													b => b.id === localFilter.business_type_id
												),
												language
										  )
										: language === 'hy'
										? 'Ընտրել'
										: language === 'ru'
										? 'Выбрать'
										: 'Select'}
								</span>
								<ChevronDown className='w-4 h-4 text-gray-400' />
							</button>

							{showBusinessTypeDropdown && (
								<div className='absolute z-50 mt-2 w-full text-gray-600 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto'>
									{businessTypes.map(type => (
										<button
											key={type.id}
											onClick={() => {
												handleFilterChange('business_type_id', type.id)
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

						{/* Floors */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Հարկեր'
									: language === 'ru'
									? 'Этажи'
									: 'Floors'}
							</label>
							<div className='relative'>
								<Layers3 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='number'
									placeholder={t.any}
									value={localFilter.floors || ''}
									onChange={e =>
										handleFilterChange(
											'floors',
											e.target.value ? parseInt(e.target.value) : undefined
										)
									}
									className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm'
									min='1'
								/>
							</div>
						</div>

						{/* Ceiling Height */}
						<div className='relative mt-2'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Առաստաղի բարձրություն (մ)'
									: language === 'ru'
									? 'Высота потолка (м)'
									: 'Ceiling Height (m)'}
							</label>
							<div className='relative'>
								<RxHeight className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='number'
									placeholder={t.any}
									value={localFilter.ceiling_height || ''}
									onChange={e =>
										handleFilterChange(
											'ceiling_height',
											e.target.value ? parseFloat(e.target.value) : undefined
										)
									}
									className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
									min='2'
									max='6'
									step='0.1'
								/>
							</div>
						</div>
					</>
				)

			case 'land':
				return (
					<>
						{/* Area in Acres */}
						<div className='relative'>
							<label className='block text-xs font-semibold text-gray-700 mb-1'>
								{language === 'hy'
									? 'Մակերես (մ²)'
									: language === 'ru'
									? 'Площадь (м²)'
									: 'Area (m²)'}
							</label>
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<Trees className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.startFiltering}
										value={localFilter.min_area_acres || ''}
										onChange={e =>
											handleFilterChange(
												'min_area_acres',
												e.target.value ? parseFloat(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
										step='0.01'
									/>
								</div>
								<div className='relative flex-1'>
									<Trees className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										type='number'
										placeholder={t.endFiltering}
										value={localFilter.max_area_acres || ''}
										onChange={e =>
											handleFilterChange(
												'max_area_acres',
												e.target.value ? parseFloat(e.target.value) : undefined
											)
										}
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600'
										min={0}
										step='0.01'
									/>
								</div>
							</div>
						</div>
					</>
				)

			default:
				return null
		}
	}

	useEffect(() => {
		console.log('BUSINESS TYPES:', buildingTypes)
	}, [buildingTypes])

	return (
		<div className='flex flex-col gap-6'>
			{/* Property Type */}
			<div className='w-full'>
				<FilterSection
					title={t.propertyType}
					icon={Home}
					badge={localFilter.property_type ? '1' : undefined}
				>
					<div className='grid grid-cols-1 gap-2'>
						{propertyTypes.map(({ type, icon: TypeIcon, label, color }) => (
							<button
								key={type}
								onClick={() =>
									handleFilterChange(
										'property_type',
										isPropertyType(type) ? undefined : type
									)
								}
								className={`group relative flex items-center p-2 rounded-xl border-2 gap-2 text-left ${
									isPropertyType(type)
										? `border-${color}-300 bg-${color}-50 shadow-md`
										: 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<div
									className={`w-8 h-8 rounded-xl flex items-center justify-center ${
										isPropertyType(type)
											? `bg-${color}-100`
											: 'bg-gray-100 group-hover:bg-gray-200'
									}`}
								>
									<TypeIcon
										className={`w-4 h-4 ${
											isPropertyType(type)
												? `text-${color}-600`
												: 'text-gray-500'
										}`}
									/>
								</div>
								<span
									className={`text-sm font-medium ${
										isPropertyType(type) ? `text-${color}-700` : 'text-gray-700'
									}`}
								>
									{label}
								</span>
							</button>
						))}
					</div>
				</FilterSection>
			</div>

			{/* Listing Type */}
			<div className='w-full'>
				<FilterSection
					title={t.listingType}
					icon={KeyRound}
					badge={localFilter.listing_type ? '1' : undefined}
				>
					<div className='space-y-2'>
						{listingTypes.map(({ type, label, color, icon }) => (
							<button
								key={type}
								onClick={() =>
									handleFilterChange(
										'listing_type',
										localFilter.listing_type === type ? undefined : type
									)
								}
								className={`w-full flex items-center p-2 rounded-xl border-2 gap-2 transition-all duration-200 ${
									localFilter.listing_type === type
										? `border-${color}-300 bg-${color}-50 shadow-md`
										: 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<span
									className={`flex items-center justify-center w-8 h-8 rounded-xl ${
										localFilter.listing_type === type
											? `bg-${color}-100`
											: 'bg-gray-100 group-hover:bg-gray-200'
									}`}
								>
									{icon}
								</span>
								<span
									className={`text-sm font-medium ${
										localFilter.listing_type === type
											? `text-${color}-700`
											: 'text-gray-700'
									}`}
								>
									{label}
								</span>
							</button>
						))}
					</div>
				</FilterSection>
			</div>

			{/* Location */}
			<div className='w-full'>
				<FilterSection
					title={t.location}
					icon={MapPin}
					badge={
						getSelectedStateIds().length ||
						getSelectedCityIds().length ||
						getSelectedDistrictIds().length
							? (
									getSelectedStateIds().length +
									getSelectedCityIds().length +
									getSelectedDistrictIds().length
							  ).toString()
							: undefined
					}
				>
					<div className='space-y-4'>
						{/* States Multi-Select */}
						<div className='relative' ref={stateDropdownRef}>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								{t.stateProvince}
							</label>

							{/* Dropdown Button */}
							<button
								type='button'
								onClick={() => setShowStateDropdown(!showStateDropdown)}
								className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
							>
								<div className='flex items-center gap-2'>
									<MapPin className='w-4 h-4 text-gray-600' />
									<span className='text-gray-600'>
										{getSelectedStateIds().length > 0
											? `${getSelectedStateIds().length} ${
													language === 'hy'
														? 'նահանգ'
														: language === 'ru'
														? 'регионов'
														: 'states'
											  } ${
													language === 'hy'
														? 'ընտրված է'
														: language === 'ru'
														? 'выбрано'
														: 'selected'
											  }`
											: t.allStates}
									</span>
								</div>
								<ChevronDown
									className={`w-4 h-4 text-gray-400 transition-transform ${
										showStateDropdown ? 'rotate-180' : ''
									}`}
								/>
							</button>

							{/* Dropdown Menu */}
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
													checked={getSelectedStateIds().includes(state.id)}
													onChange={() => toggleState(state.id)}
													className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
												/>
												{getSelectedStateIds().includes(state.id) && (
													<Check className='w-3 h-3 absolute left-0.5 pointer-events-none' />
												)}
											</div>
											<span className='ml-3 text-sm text-gray-700'>
												{getTranslatedStateName(state.name, language)}
												{state.uses_districts && ` (${t.districts})`}
											</span>
										</label>
									))}
								</div>
							)}
						</div>

						{/* Districts Multi-Select */}
						{districts.length > 0 && (
							<div className='relative' ref={districtDropdownRef}>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									{t.district}
								</label>

								{/* Dropdown Button */}
								<button
									type='button'
									onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
									className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								>
									<div className='flex items-center gap-2'>
										<Building2 className='w-4 h-4 text-gray-600' />
										<span className='text-gray-600'>
											{getSelectedDistrictIds().length > 0
												? `${getSelectedDistrictIds().length} ${
														language === 'hy'
															? 'շրջան'
															: language === 'ru'
															? 'районов'
															: 'districts'
												  } ${
														language === 'hy'
															? 'ընտրված է'
															: language === 'ru'
															? 'выбрано'
															: 'selected'
												  }`
												: t.allDistricts}
										</span>
									</div>
									<ChevronDown
										className={`w-4 h-4 text-gray-400 transition-transform ${
											showDistrictDropdown ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{/* Dropdown Menu */}
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
														checked={getSelectedDistrictIds().includes(
															district.id
														)}
														onChange={() => toggleDistrict(district.id)}
														className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
													/>
													{getSelectedDistrictIds().includes(district.id) && (
														<Check className='w-3 h-3 absolute left-0.5 pointer-events-none' />
													)}
												</div>
												<span className='ml-3 text-sm text-gray-700'>
													{getTranslatedDistrictName(district, language)}
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
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									{t.city}
								</label>

								{/* Dropdown Button */}
								<button
									type='button'
									onClick={() => setShowCityDropdown(!showCityDropdown)}
									className='w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
								>
									<div className='flex items-center gap-2'>
										<Building2 className='w-4 h-4 text-gray-600' />
										<span className='text-gray-600'>
											{getSelectedCityIds().length > 0
												? `${getSelectedCityIds().length} ${
														language === 'hy'
															? 'քաղաք'
															: language === 'ru'
															? 'городов'
															: 'cities'
												  } ${
														language === 'hy'
															? 'ընտրված է'
															: language === 'ru'
															? 'выбрано'
															: 'selected'
												  }`
												: t.allCities}
										</span>
									</div>
									<ChevronDown
										className={`w-4 h-4 text-gray-400 transition-transform ${
											showCityDropdown ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{/* Dropdown Menu */}
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
														checked={getSelectedCityIds().includes(city.id)}
														onChange={() => toggleCity(city.id)}
														className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
													/>
													{getSelectedCityIds().includes(city.id) && (
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
					</div>
				</FilterSection>
			</div>

			{/* Price Range */}
			<div className='w-full'>
				<FilterSection
					title={t.priceRange}
					icon={DollarSign}
					badge={
						localFilter.min_price || localFilter.max_price ? '1' : undefined
					}
				>
					<div className='space-y-4'>
						<div className='relative'>
							<label className='block text-xs font-semibold text-gray-700 mb-2'>
								{t.priceRange}
							</label>
							<div className='flex gap-3'>
								<div className='relative flex-1'>
									<DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600' />
									<input
										type='text'
										placeholder={t.startFiltering}
										value={localPrices.min}
										onChange={e => handlePriceChange('min', e.target.value)}
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
								<div className='relative flex-1'>
									<DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600' />
									<input
										type='text'
										placeholder={t.endFiltering}
										value={localPrices.max}
										onChange={e => handlePriceChange('max', e.target.value)}
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>
						</div>
					</div>
				</FilterSection>
			</div>

			{/* Property Details - Only show if property type is selected */}
			{localFilter.property_type && (
				<div className='w-full'>
					<FilterSection
						title={t.propertyDetails}
						icon={Bed}
						badge={
							localFilter.bedrooms ||
							localFilter.bathrooms ||
							localFilter.floors ||
							localFilter.floor ||
							localFilter.total_floors ||
							localFilter.ceiling_height ||
							localFilter.min_lot_size_sqft ||
							localFilter.max_lot_size_sqft ||
							localFilter.business_type ||
							localFilter.min_area_acres ||
							localFilter.max_area_acres ||
							localFilter.min_area_sqft ||
							localFilter.max_area_sqft
								? '1'
								: undefined
						}
					>
						<div className='space-y-2'>{renderPropertySpecificFields()}</div>
					</FilterSection>
				</div>
			)}

			{/* Features */}
			{/*<div className='w-full'>
				<FilterSection
					title={t.featuresAndAmenities}
					icon={Star}
					badge={localFilter.features?.length || undefined}
				>
					<div className='space-y-3'>
						{features.length > 0 ? (
							<div className='grid grid-cols-1 gap-2 max-h-48 overflow-y-auto'>
								{features.map(feature => (
									<label
										key={feature.id}
										className='group flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer'
									>
										<input
											type='checkbox'
											checked={
												localFilter.features?.includes(feature.id) || false
											}
											onChange={e => {
												const currentFeatures = localFilter.features || []
												const newFeatures = e.target.checked
													? [...currentFeatures, feature.id]
													: currentFeatures.filter(id => id !== feature.id)
												handleFilterChange(
													'features',
													newFeatures.length > 0 ? newFeatures : undefined
												)
											}}
											className='w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3'
										/>
										<span className='text-sm text-gray-700 group-hover:text-gray-900 font-medium'>
											{getTranslatedFeature(feature.name, language)}
										</span>
									</label>
								))}
							</div>
						) : (
							<div className='text-center py-8 text-gray-500'>
								<Star className='w-8 h-8 mx-auto mb-2 text-gray-300' />
								<p className='text-sm'>{t.noFeaturesAvailable}</p>
							</div>
						)}
					</div>
				</FilterSection>
			</div>*/}

			{/* Action Buttons - UPDATED: Only apply on button click */}
			<div className='w-full space-y-3'>
				<button
					onClick={applyFilters}
					className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'
				>
					<Search className='w-5 h-5 mr-2' />
					{t.applyFilters}
				</button>

				{hasActiveFilters() && (
					<button
						onClick={clearFilter}
						className='w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center justify-center'
					>
						<X className='w-4 h-4 mr-2' />
						{t.clearAllFilters}
					</button>
				)}
			</div>

		</div>
	)
}
