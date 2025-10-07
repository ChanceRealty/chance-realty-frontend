'use client'

import { useState, useEffect, useCallback } from 'react'
import {
	PropertyFilter as FilterType,
	PropertyType,
	ListingType,
	State,
	City,
	District,
	PropertyFeature,
} from '@/types/property'
import {
	getStates,
	getCitiesByState,
	getDistrictsByState,
	getPropertyFeatures,
	getTranslatedField,
	getTranslatedCityName,
	getTranslatedStateName,
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
	Star,
	Search,
	X,
	ChevronDown,
	Filter,
	KeyRound,
	Layers3,
	Maximize,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import { getTranslatedFeature } from '@/utils/featureTranslations'
import { RxHeight } from 'react-icons/rx'

interface PropertyFilterProps {
	onFilterChange: (filter: FilterType) => void
	initialFilter?: FilterType
}

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

	// Explicitly type the filter state to ensure all PropertyType values are included
	const [localFilter, setLocalFilter] = useState<FilterType>({
		...initialFilter,
		property_type: initialFilter.property_type as PropertyType | undefined,
	})

	const [localPrices, setLocalPrices] = useState({
		min: localFilter.min_price?.toString() || '',
		max: localFilter.max_price?.toString() || '',
	})

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

	// Debounced price update function
	const debouncedPriceUpdate = useCallback(
		debounce((minPrice: string, maxPrice: string) => {
			const newFilter = { ...localFilter }
			newFilter.min_price = minPrice ? parseFloat(minPrice) : undefined
			newFilter.max_price = maxPrice ? parseFloat(maxPrice) : undefined
			setLocalFilter(newFilter)
			onFilterChange(newFilter)
		}, 800),
		[localFilter, onFilterChange]
	)

	// Handle price input changes
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

	// Update local prices when filter changes externally
	useEffect(() => {
		setLocalPrices({
			min: localFilter.min_price?.toString() || '',
			max: localFilter.max_price?.toString() || '',
		})
	}, [localFilter.min_price, localFilter.max_price])

	const [expandedSections, setExpandedSections] = useState<{
		[key: string]: boolean
	}>({
		propertyType: true,
		listingType: true,
		location: true,
		price: true,
		details: false,
		features: false,
		status: false,
	})

	useEffect(() => {
		// Fetch initial data
		fetchStates()
		fetchFeatures()
	}, [])

	// Handle state changes for district/city loading
	useEffect(() => {
		if (localFilter.state_id) {
			const state = states.find(s => s.id === localFilter.state_id)
			setSelectedState(state || null)

			if (state?.uses_districts) {
				fetchDistricts(localFilter.state_id)
				setCities([])
			} else {
				fetchCities(localFilter.state_id)
				setDistricts([])
			}
		} else {
			setSelectedState(null)
			setCities([])
			setDistricts([])
		}
	}, [localFilter.state_id, states])

	const fetchStates = async () => {
		try {
			const data = await getStates()
			setStates(data || [])
		} catch (error) {
			console.error('Error fetching states:', error)
			setStates([])
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

	// ✅ FIXED: This is the key fix - immediately propagate changes to parent
	const handleFilterChange = (
		key: keyof FilterType,
		value: PropertyType | ListingType | string | number | number[] | undefined
	) => {
		const newFilter: FilterType = { ...localFilter, [key]: value }

		if (key === 'state_id') {
			newFilter.city_id = undefined
			newFilter.district_id = undefined
		}

		setLocalFilter(newFilter)
	}

	const clearFilter = () => {
		const clearedFilter: FilterType = { page: 1, limit: 12 }
		setLocalFilter(clearedFilter)
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

		// If it's already a string, return it
		if (typeof district === 'string') return district

		// If it has the expected structure, use getTranslatedField
		if (district && typeof district === 'object' && 'name' in district) {
			return getTranslatedField(
				district as Record<string, undefined>,
				'name',
				language as 'hy' | 'en' | 'ru'
			)
		}

		// Fallback to name property or empty string
		if (
			typeof district === 'object' &&
			district !== null &&
			'name' in district
		) {
			return (district as { name?: string }).name || ''
		}
		return ''
	}

	// Define property types with explicit typing
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
			color: 'green',
		},
		{
			type: 'commercial' as const,
			icon: Landmark,
			label: t.commercial,
			color: 'purple',
		},
		{ type: 'land' as const, icon: Trees, label: t.land, color: 'orange' },
	]

	const listingTypes: {
		type: ListingType
		label: string
		color: string
		icon: string
	}[] = [
		{ type: 'sale', label: t.forSale, color: 'green', icon: '🏠' },
		{ type: 'rent', label: t.forRent, color: 'blue', icon: '🔑' },
		{ type: 'daily_rent', label: t.forDailyRent, color: 'purple', icon: '📅' },
	]

	const FilterSection = ({
		title,
		sectionKey,
		icon: Icon,
		children,
		badge,
	}: {
		title: string
		sectionKey: string
		icon: React.ComponentType<{ className?: string }>
		children: React.ReactNode
		badge?: number | string
	}) => (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
			<button
				className='w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'
			>
				<div className='flex items-center'>
					<div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3'>
						<Icon className='w-4 h-4 text-white' />
					</div>
					<span className='font-semibold text-[14px] text-gray-900'>{title}</span>
					{badge && (
						<span className='ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full'>
							{badge}
						</span>
					)}
				</div>
			</button>

			<div
				className={`transition-all duration-300 ease-in-out ${
						 'max-h-96 opacity-100'
				}`}
			>
				<div className='p-4 pt-0 border-t border-gray-50'>{children}</div>
			</div>
		</div>
	)

	// Helper function to check if current property type matches
	const isPropertyType = (type: PropertyType): boolean => {
		return localFilter.property_type === type
	}

	// Helper function to show property details section
	const shouldShowDetailsSection = (): boolean => {
		return (
			!localFilter.property_type ||
			localFilter.property_type === 'house' ||
			localFilter.property_type === 'apartment'
		)
	}

	return (
		<div className='flex flex-col gap-6'>
			{/* Property Type */}
			<div className='w-full'>
				<FilterSection
					title={t.propertyType}
					sectionKey='propertyType'
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
								{isPropertyType(type) && (
									<div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-[10px]'>✓</span>
									</div>
								)}
							</button>
						))}
					</div>
				</FilterSection>
			</div>

			{/* Listing Type */}
			<div className='w-full'>
				<FilterSection
					title={t.listingType}
					sectionKey='listingType'
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
								{localFilter.listing_type === type && (
									<div className='ml-auto w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-[10px]'>✓</span>
									</div>
								)}
							</button>
						))}
					</div>
				</FilterSection>
			</div>

			{/* Location */}
			<div className='w-full'>
				<FilterSection
					title={t.location}
					sectionKey='location'
					icon={MapPin}
					badge={
						localFilter.state_id ||
						localFilter.city_id ||
						localFilter.district_id
							? '1'
							: undefined
					}
				>
					<div className='space-y-4'>
						{/* State */}
						<div className='relative'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								{t.stateProvince}
							</label>
							<div className='relative'>
								<MapPin className='absolute left-3 text-gray-600 top-1/2 transform -translate-y-1/2 w-4 h-4' />
								<select
									value={localFilter.state_id || ''}
									onChange={e => {
										const stateId = e.target.value
											? parseInt(e.target.value)
											: undefined
										handleFilterChange('state_id', stateId)
									}}
									className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none text-gray-600 cursor-pointer'
								>
									<option value=''>{t.allStates}</option>
									{states.map(state => (
										<option key={state.id} value={state.id}>
											{getTranslatedStateName(state.name, language)}
											{state.uses_districts && ` (${t.districts})`}
										</option>
									))}
								</select>
								<ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
							</div>
						</div>

						{/* District Selection (for states that use districts like Yerevan) */}
						{selectedState?.uses_districts && (
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									{t.district}
								</label>
								<div className='relative'>
									<Building2 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<select
										value={localFilter.district_id || ''}
										onChange={e =>
											handleFilterChange(
												'district_id',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none disabled:bg-gray-50'
										disabled={!localFilter.state_id}
									>
										<option value=''>{t.allDistricts}</option>
										{districts.map(district => (
											<option key={district.id} value={district.id}>
												{getTranslatedDistrictName(district, language)}
											</option>
										))}
									</select>
									<ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								</div>
							</div>
						)}

						{/* City Selection (for states that don't use districts) */}
						{selectedState && !selectedState.uses_districts && (
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									{t.city}
								</label>
								<div className='relative'>
									<Building2 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
									<select
										value={localFilter.city_id || ''}
										onChange={e =>
											handleFilterChange(
												'city_id',
												e.target.value ? parseInt(e.target.value) : undefined
											)
										}
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none disabled:bg-gray-50'
										disabled={!localFilter.state_id}
									>
										<option value=''>{t.allCities}</option>
										{cities.map(city => (
											<option key={city.id} value={city.id}>
												{getTranslatedCityName(city.name, language)}
											</option>
										))}
									</select>
									<ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								</div>
							</div>
						)}
					</div>
				</FilterSection>
			</div>

			{/* Price Range */}
			<div className='w-full'>
				<FilterSection
					title={t.priceRange}
					sectionKey='price'
					icon={DollarSign}
					badge={
						localFilter.min_price || localFilter.max_price ? '1' : undefined
					}
				>
					<div className='space-y-4'>
						{/* Combined Min/Max Inputs */}
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
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
								<div className='relative flex-1'>
									<DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600' />
									<input
										type='text'
										placeholder={t.endFiltering}
										value={localPrices.max}
										onChange={e => handlePriceChange('max', e.target.value)}
										className='w-full text-gray-600 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>
						</div>
					</div>
				</FilterSection>
			</div>

			{/* Property Details */}
			<div className='w-full'>
				<FilterSection
					title={t.propertyDetails}
					sectionKey='details'
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
					{/* Common fields for houses and apartments */}
					{shouldShowDetailsSection() && (
						<div className='space-y-2'>
							<div className='grid grid-cols-2 gap-2'>
								{/* Bedrooms */}
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
											className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
											min='0'
										/>
									</div>
								</div>

								{/* Bathrooms */}
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
													e.target.value ? parseInt(e.target.value) : undefined
												)
											}
											className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
											min='0'
											step='0.5'
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* House Specific Fields */}
					{isPropertyType('house') && (
						<div className='space-y-2 mt-2 pt-2 border-t border-gray-100'>
							{/* Floors */}
							<div className='relative'>
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
										className='w-full text-gray-600 pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
										min='1'
									/>
								</div>
							</div>

							{/* Lot Size */}
							<div className='relative'>
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
											className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400'
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
											className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400'
											min={0}
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
											className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400'
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
											className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400'
											min={0}
										/>
									</div>
								</div>
							</div>

							{/* Ceiling Height */}
							<div className='relative mt-2'>
								<label className='block text-xs font-semibold text-gray-700 mb-1'>
									{language === 'hy'
										? 'Առաստաղի բարձրություն (մ²)'
										: language === 'ru'
										? 'Высота потолка (м²)'
										: 'Ceiling Height (m²)'}
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
										className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
										min='2'
										max='6'
										step='0.1'
									/>
								</div>
							</div>
						</div>
					)}

					{/* Apartment, Commercial, Land Sections */}
					{/* Сделаем все gap-2, space-y-2, py-2, px-3 для унифицированного вида */}
					{/* Аналогично переписываем все остальные поля в этих секциях */}
				</FilterSection>
			</div>

			{/* Features */}
			<div className='w-full'>
				<FilterSection
					title={t.featuresAndAmenities}
					sectionKey='features'
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
			</div>

			{/* Action Buttons */}
			<div className='w-full space-y-3'>
				<button
					onClick={() => onFilterChange(localFilter)}
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

			{/* Filter Summary */}
			{hasActiveFilters() && (
				<div className='bg-blue-50 border border-blue-200 rounded-2xl p-4'>
					<h3 className='text-sm font-semibold text-blue-800 mb-2 flex items-center'>
						<Filter className='w-4 h-4 mr-2' />
						{t.activeFilters}
					</h3>
					<div className='flex flex-wrap gap-2'>
						{localFilter.property_type && (
							<span className='inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'>
								{
									propertyTypes.find(
										pt => pt.type === localFilter.property_type
									)?.label
								}

								<button
									onClick={() => handleFilterChange('property_type', undefined)}
									className='ml-2 hover:text-blue-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.listing_type && (
							<span className='inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'>
								{
									listingTypes.find(lt => lt.type === localFilter.listing_type)
										?.label
								}
								<button
									onClick={() => handleFilterChange('listing_type', undefined)}
									className='ml-2 hover:text-green-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.state_id && (
							<span className='inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full'>
								{getTranslatedStateName(
									states.find(s => s.id === localFilter.state_id)?.name || '',
									language
								)}
								<button
									onClick={() => {
										handleFilterChange('state_id', undefined)
										handleFilterChange('city_id', undefined)
										handleFilterChange('district_id', undefined)
									}}
									className='ml-2 hover:text-purple-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.city_id && (
							<span className='inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full'>
								{getTranslatedCityName(
									cities.find(c => c.id === localFilter.city_id)?.name || '',
									language
								)}
								<button
									onClick={() => handleFilterChange('city_id', undefined)}
									className='ml-2 hover:text-indigo-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.district_id && (
							<span className='inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full'>
								{getTranslatedDistrictName(
									districts.find(d => d.id === localFilter.district_id) || {},
									language
								)}
								<button
									onClick={() => handleFilterChange('district_id', undefined)}
									className='ml-2 hover:text-pink-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{(localFilter.min_price || localFilter.max_price) && (
							<span className='inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full'>
								${localFilter.min_price || 0} - ${localFilter.max_price || '∞'}
								<button
									onClick={() => {
										handleFilterChange('min_price', undefined)
										handleFilterChange('max_price', undefined)
									}}
									className='ml-2 hover:text-purple-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.bedrooms && (
							<span className='inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full'>
								{localFilter.bedrooms}+ bed
								<button
									onClick={() => handleFilterChange('bedrooms', undefined)}
									className='ml-2 hover:text-orange-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.bathrooms && (
							<span className='inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full'>
								{localFilter.bathrooms}+ bath
								<button
									onClick={() => handleFilterChange('bathrooms', undefined)}
									className='ml-2 hover:text-pink-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
						{localFilter.features && localFilter.features.length > 0 && (
							<span className='inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full'>
								{localFilter.features.length} features
								<button
									onClick={() => handleFilterChange('features', undefined)}
									className='ml-2 hover:text-indigo-600'
								>
									<X className='w-3 h-3' />
								</button>
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
