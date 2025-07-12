// src/app/[locale]/page.tsx - Updated with translations
"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PropertyCard from '../_components/PropertyCard'
import { Property, PropertyType, ListingType, State, City, District } from '@/types/property'
import { getCitiesByState, getDistrictsByState, getRecentProperties, getStates, getTranslatedCityName, getTranslatedField, getTranslatedStateName } from '@/services/propertyService'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import {
	Search,
	Home,
	Building2,
	Landmark,
	Trees,
	ArrowRight,
	MapPin,
	DollarSign,
	Bed,
	Bath,
	Square,
	ChevronDown,
	ChevronUp,
	Filter,
	X,
	SlidersHorizontal,
} from 'lucide-react'

export default function HomePage() {
	const t = useTranslations()
	const { language } = useLanguage()
	const [recentProperties, setRecentProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)
	const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
	const [customId, setCustomId] = useState('')
	const [states, setStates] = useState<State[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [districts, setDistricts] = useState<District[]>([])
	const [selectedState, setSelectedState] = useState<State | null>(null)

	// Advanced search state
	const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | ''>('')
	const [advancedSearch, setAdvancedSearch] = useState({
		listing_type: '' as ListingType | '',
		location: '',
		min_price: '',
		max_price: '',
		bedrooms: '',
		bathrooms: '',
		min_area: '',
		max_area: '',
		state_id: undefined as number | undefined,
		city_id: undefined as number | undefined,
		district_id: undefined as number | undefined,
		floors: '',
		floor: '',
		total_floors: '',
		ceiling_height: '',
		lot_size_sqft: '',
		business_type: '',
		area_acres: '',
		features: [] as number[],
	})

	useEffect(() => {
		const fetchProperties = async () => {
			try {
				const [ recent] = await Promise.all([
					getRecentProperties(8),
				])
				setRecentProperties(recent || [])
			} catch (error) {
				console.error('Error fetching properties:', error)
				setRecentProperties([])
			} finally {
				setLoading(false)
			}
		}
		fetchProperties()
	}, [])

	useEffect(() => {
		// Fetch states on component mount
		const fetchStates = async () => {
			try {
				const statesData = await getStates()
				setStates(statesData || [])
			} catch (error) {
				console.error('Error fetching states:', error)
			}
		}
		fetchStates()
	}, [])

	useEffect(() => {
		// Handle state changes for district/city loading
		if (advancedSearch.state_id) {
			const state = states.find(s => s.id === advancedSearch.state_id)
			setSelectedState(state || null)

			if (state?.uses_districts) {
				fetchDistricts(advancedSearch.state_id)
				setCities([])
			} else {
				fetchCities(advancedSearch.state_id)
				setDistricts([])
			}
		} else {
			setSelectedState(null)
			setCities([])
			setDistricts([])
		}
	}, [advancedSearch.state_id, states])

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
			area_sqft: { hy: 'Մակերես', ru: 'Площадь', en: 'Area' },
			lot_size_sqft: {
				hy: 'Հողատարածքի չափ',
				ru: 'Размер участка',
				en: 'Lot Size',
			},
			floors: { hy: 'Հարկեր', ru: 'Этажи', en: 'Floors' },
			floor: { hy: 'Հարկ', ru: 'Этаж', en: 'Floor' },
			total_floors: {
				hy: 'Ընդհանուր հարկեր',
				ru: 'Всего этажей',
				en: 'Total Floors',
			},
			ceiling_height: {
				hy: 'Առաստաղի բարձրություն',
				ru: 'Высота потолка',
				en: 'Ceiling Height',
			},
			business_type: {
				hy: 'Բիզնեսի տեսակ',
				ru: 'Тип бизнеса',
				en: 'Business Type',
			},
			area_acres: {
				hy: 'Մակերես (մետրեր)',
				ru: 'Площадь (метры)',
				en: 'Area (meters)',
			},
		}
		return labels[key]?.[language] || key
	}	

	const handleAdvancedSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const params = new URLSearchParams()

		// Basic filters
		if (selectedPropertyType)
			params.append('property_type', selectedPropertyType)
		if (advancedSearch.listing_type)
			params.append('listing_type', advancedSearch.listing_type)
		if (advancedSearch.location)
			params.append('location', advancedSearch.location)
		if (advancedSearch.min_price)
			params.append('min_price', advancedSearch.min_price)
		if (advancedSearch.max_price)
			params.append('max_price', advancedSearch.max_price)
		if (advancedSearch.bedrooms)
			params.append('bedrooms', advancedSearch.bedrooms)
		if (advancedSearch.bathrooms)
			params.append('bathrooms', advancedSearch.bathrooms)
		if (advancedSearch.min_area)
			params.append('min_area', advancedSearch.min_area)
		if (advancedSearch.max_area)
			params.append('max_area', advancedSearch.max_area)

		// Location filters
		if (advancedSearch.state_id)
			params.append('state_id', advancedSearch.state_id.toString())
		if (advancedSearch.city_id)
			params.append('city_id', advancedSearch.city_id.toString())
		if (advancedSearch.district_id)
			params.append('district_id', advancedSearch.district_id.toString())

		// Property type specific filters
		if (advancedSearch.floors) params.append('floors', advancedSearch.floors)
		if (advancedSearch.floor) params.append('floor', advancedSearch.floor)
		if (advancedSearch.total_floors)
			params.append('total_floors', advancedSearch.total_floors)
		if (advancedSearch.ceiling_height)
			params.append('ceiling_height', advancedSearch.ceiling_height)
		if (advancedSearch.lot_size_sqft)
			params.append('lot_size_sqft', advancedSearch.lot_size_sqft)
		if (advancedSearch.business_type)
			params.append('business_type', advancedSearch.business_type)
		if (advancedSearch.area_acres)
			params.append('area_acres', advancedSearch.area_acres)

		// Features
		if (advancedSearch.features.length > 0) {
			params.append('features', advancedSearch.features.join(','))
		}

		// Navigate to properties page with all filters
		window.location.href = `/${language}/properties?${params.toString()}`
	}


	const clearAdvancedSearch = () => {
		setSelectedPropertyType('')
		setAdvancedSearch({
			listing_type: '',
			location: '',
			min_price: '',
			max_price: '',
			bedrooms: '',
			bathrooms: '',
			min_area: '',
			max_area: '',
			state_id: undefined,
			city_id: undefined,
			district_id: undefined,
			floors: '',
			floor: '',
			total_floors: '',
			ceiling_height: '',
			lot_size_sqft: '',
			business_type: '',
			area_acres: '',
			features: [],
		})
	}

	const propertyTypes = [
		{
			type: 'house' as PropertyType,
			icon: Home,
			label: t.house,
			color: 'blue',
			gradient: 'from-blue-500 to-blue-600',
		},
		{
			type: 'apartment' as PropertyType,
			icon: Building2,
			label: t.apartment,
			color: 'emerald',
			gradient: 'from-emerald-500 to-emerald-600',
		},
		{
			type: 'commercial' as PropertyType,
			icon: Landmark,
			label: t.commercial,
			color: 'violet',
			gradient: 'from-violet-500 to-violet-600',
		},
		{
			type: 'land' as PropertyType,
			icon: Trees,
			label: t.land,
			color: 'amber',
			gradient: 'from-amber-500 to-amber-600',
		},
	]

	const getPropertyTypeFields = () => {
		switch (selectedPropertyType) {
			case 'house':
				return (
					<>
						{/* Bedrooms & Bathrooms */}
						<div className='col-span-2 grid grid-cols-2 gap-4'>
							<div className='relative group'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('bedrooms')}
								</label>
								<div className='relative'>
									<Bed className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
										className='w-full text-gray-600 pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>

							<div className='relative group'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('bathrooms')}
								</label>
								<div className='relative'>
									<Bath className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
										className='w-full text-gray-600 pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>
						</div>

						{/* Floors & Lot Size */}
						<div className='col-span-2 grid grid-cols-2 gap-4'>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('floors')}
								</label>
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
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
									min='1'
								/>
							</div>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('lot_size_sqft')}
								</label>
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.lot_size_sqft}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											lot_size_sqft: e.target.value,
										})
									}
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
									min='0'
								/>
							</div>
						</div>

						{/* Ceiling Height */}
						<div className='relative'>
							<label className='block text-sm font-semibold text-gray-700 mb-3'>
								{getAttributeLabel('ceiling_height')}
							</label>
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
								className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
								min='2'
								max='6'
								step='0.1'
							/>
						</div>
					</>
				)

			case 'apartment':
				return (
					<>
						{/* Bedrooms & Bathrooms */}
						<div className='col-span-2 grid grid-cols-2 gap-4'>
							<div className='relative group'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('bedrooms')}
								</label>
								<div className='relative'>
									<Bed className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
										className='w-full text-gray-600 pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>

							<div className='relative group'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('bathrooms')}
								</label>
								<div className='relative'>
									<Bath className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
										className='w-full text-gray-600 pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									/>
								</div>
							</div>
						</div>

						{/* Floor & Total Floors */}
						<div className='col-span-2 grid grid-cols-2 gap-4'>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('floor')}
								</label>
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
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
									min='1'
								/>
							</div>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('total_floors')}
								</label>
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
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
									min='1'
								/>
							</div>
						</div>

						{/* Ceiling Height */}
						<div className='relative'>
							<label className='block text-sm font-semibold text-gray-700 mb-3'>
								{getAttributeLabel('ceiling_height')}
							</label>
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
								className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
								min='2'
								max='6'
								step='0.1'
							/>
						</div>
					</>
				)

			case 'commercial':
				return (
					<>
						{/* Business Type */}
						<div className='relative'>
							<label className='block text-sm font-semibold text-gray-700 mb-3'>
								{getAttributeLabel('business_type')}
							</label>
							<select
								value={advancedSearch.business_type}
								onChange={e =>
									setAdvancedSearch({
										...advancedSearch,
										business_type: e.target.value,
									})
								}
								className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white'
							>
								<option value=''>{t.any}</option>
								<option value='office'>
									{language === 'hy'
										? 'Գրասենյակ'
										: language === 'ru'
										? 'Офис'
										: 'Office'}
								</option>
								<option value='retail'>
									{language === 'hy'
										? 'Խանութ'
										: language === 'ru'
										? 'Магазин'
										: 'Retail'}
								</option>
								<option value='restaurant'>
									{language === 'hy'
										? 'Ռեստորան'
										: language === 'ru'
										? 'Ресторан'
										: 'Restaurant'}
								</option>
								<option value='warehouse'>
									{language === 'hy'
										? 'Պահեստ'
										: language === 'ru'
										? 'Склад'
										: 'Warehouse'}
								</option>
								<option value='factory'>
									{language === 'hy'
										? 'Գործարան'
										: language === 'ru'
										? 'Завод'
										: 'Factory'}
								</option>
								<option value='hotel'>
									{language === 'hy'
										? 'Հյուրանոց'
										: language === 'ru'
										? 'Отель'
										: 'Hotel'}
								</option>
							</select>
						</div>

						{/* Floors & Ceiling Height */}
						<div className='col-span-2 grid grid-cols-2 gap-4'>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('floors')}
								</label>
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
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
									min='1'
								/>
							</div>
							<div className='relative'>
								<label className='block text-sm font-semibold text-gray-700 mb-3'>
									{getAttributeLabel('ceiling_height')}
								</label>
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
									className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
									min='2'
									max='10'
									step='0.1'
								/>
							</div>
						</div>
					</>
				)

			case 'land':
				return (
					<>
						{/* Land Area */}
						<div className='relative'>
							<label className='block text-sm font-semibold text-gray-700 mb-3'>
								{getAttributeLabel('area_acres')}
							</label>
							<input
								type='number'
								placeholder={t.any}
								value={advancedSearch.area_acres}
								onChange={e =>
									setAdvancedSearch({
										...advancedSearch,
										area_acres: e.target.value,
									})
								}
								className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
								min='0'
							/>
						</div>

						{/* Quick Land Size Buttons */}
						<div className='col-span-2'>
							<label className='block text-sm font-semibold text-gray-700 mb-3'>
								{language === 'hy'
									? 'Արագ ընտրություն'
									: language === 'ru'
									? 'Быстрый выбор'
									: 'Quick Selection'}
							</label>
							<div className='grid grid-cols-2 gap-2'>
								{[
									{
										label:
											language === 'hy'
												? 'Մինչև 1000 քմ'
												: language === 'ru'
												? 'До 1000 кв.м'
												: 'Under 1000 sq m',
										min: 0,
										max: 1000,
									},
									{
										label:
											language === 'hy'
												? '1000-5000 քմ'
												: language === 'ru'
												? '1000-5000 кв.м'
												: '1000-5000 sq m',
										min: 1000,
										max: 5000,
									},
									{
										label:
											language === 'hy'
												? '5000-10000 քմ'
												: language === 'ru'
												? '5000-10000 кв.м'
												: '5000-10000 sq m',
										min: 5000,
										max: 10000,
									},
									{
										label:
											language === 'hy'
												? 'Ավելի քան 10000 քմ'
												: language === 'ru'
												? 'Свыше 10000 кв.м'
												: 'Over 10000 sq m',
										min: 10000,
										max: undefined,
									},
								].map((range, index) => (
									<button
										key={index}
										type='button'
										onClick={() => {
											setAdvancedSearch(prev => ({
												...prev,
												min_area: range.min.toString(),
												max_area: range.max?.toString() || '',
											}))
										}}
										className='px-3  py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors'
									>
										{range.label}
									</button>
								))}
							</div>
						</div>
					</>
				)

			default:
				return null
		}
	}

	const hasActiveFilters = () => {
		return (
			selectedPropertyType ||
			advancedSearch.listing_type ||
			advancedSearch.location ||
			advancedSearch.min_price ||
			advancedSearch.max_price ||
			advancedSearch.bedrooms ||
			advancedSearch.bathrooms ||
			advancedSearch.min_area ||
			advancedSearch.max_area ||
			advancedSearch.state_id ||
			advancedSearch.city_id ||
			advancedSearch.district_id ||
			advancedSearch.floors ||
			advancedSearch.floor ||
			advancedSearch.total_floors ||
			advancedSearch.ceiling_height ||
			advancedSearch.lot_size_sqft ||
			advancedSearch.business_type ||
			advancedSearch.area_acres ||
			advancedSearch.features.length > 0
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
				'name' in district &&
				typeof (district as { name?: unknown }).name === 'string'
			) {
				return (district as { name: string }).name
			} else {
				return ''
			}
			  
		}
	



		return (
			<div className='min-h-screen'>
				{/* Hero Section */}
				<div className='relative h-[600px]'>
					{/* Фоновое изображение */}
					<div className='absolute inset-0 z-0'>
						<Image
							src='/yerevan.jpg' 
							alt='Hero background'
							fill
							className='object-cover object-center'
							priority
						/>
					</div>

					{/* Затемнение и градиенты */}
					<div className='absolute inset-0 bg-black opacity-40 z-10'></div>
					<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10'></div>

					{/* Контент */}
					<div className='relative z-20 h-full flex items-center'>
						<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
							<div className='text-center text-white'>
								<h1 className='text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg'>
									{t.heroTitle}
								</h1>
								<p className='text-xl md:text-2xl mb-10 opacity-90 drop-shadow-md'>
									{t.heroSubtitle}
								</p>

								{/* Поисковая форма */}
								<div className='max-w-3xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20'>
									<form
										onSubmit={handleSimpleSearch}
										className='flex flex-col sm:flex-row gap-3 sm:gap-4'
									>
										<div className='relative flex-1'>
											<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
											<input
												type='text'
												placeholder={t.searchPlaceholder}
												value={customId}
												onChange={e => setCustomId(e.target.value)}
												className='w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 text-base sm:text-lg shadow-sm'
											/>
										</div>
										<button
											type='submit'
											className='bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 sm:px-8 py-3 sm:py-4 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center whitespace-nowrap font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base sm:text-lg'
										>
											<Search className='w-5 h-5 mr-2' />
											{t.search}
										</button>
									</form>

									{/* Кнопка Advanced Search */}
									<button
										onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
										className='mt-4 sm:mt-6 text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center mx-auto group transition-colors'
									>
										<SlidersHorizontal className='w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300' />
										{showAdvancedSearch
											? t.hideAdvancedSearch
											: t.showAdvancedSearch}
										{showAdvancedSearch ? (
											<ChevronUp className='w-4 h-4 ml-2' />
										) : (
											<ChevronDown className='w-4 h-4 ml-2' />
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Advanced Search Section */}
				<div
					className={`bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 transition-all duration-500 ease-in-out ${
						showAdvancedSearch
							? 'max-h-none opacity-100'
							: 'max-h-0 opacity-0 overflow-hidden'
					}`}
				>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16'>
						<div className='text-center mb-8 sm:mb-12'>
							<div className='inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg'>
								<Filter className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
							</div>
							<h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-3'>
								{t.advancedSearch}
							</h2>
							<p className='text-gray-600 text-base sm:text-lg'>
								{t.refineSearch}
							</p>
						</div>

						{/* Property Type Selection */}
						<div className='mb-8 sm:mb-12'>
							<div className='flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-3'>
								<label className='text-base sm:text-lg font-semibold text-gray-800 text-center'>
									{t.selectPropertyType}
								</label>
								{hasActiveFilters() && (
									<button
										onClick={clearAdvancedSearch}
										className='inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium'
									>
										<X className='w-4 h-4 mr-1' />
										Clear All
									</button>
								)}
							</div>
							<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto'>
								{propertyTypes.map(
									({ type, icon: Icon, label, color, gradient }) => (
										<button
											key={type}
											type='button'
											onClick={() =>
												setSelectedPropertyType(
													selectedPropertyType === type ? '' : type
												)
											}
											className={`group relative p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
												selectedPropertyType === type
													? `border-${color}-300 bg-gradient-to-br ${gradient} text-white shadow-xl scale-105`
													: 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
											}`}
										>
											<div
												className={`w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 transition-all duration-300 ${
													selectedPropertyType === type
														? 'bg-white/20 backdrop-blur-sm'
														: `bg-${color}-100 group-hover:bg-${color}-200`
												}`}
											>
												<Icon
													className={`w-4 h-4 sm:w-7 sm:h-7 transition-all duration-300 ${
														selectedPropertyType === type
															? 'text-white'
															: `text-${color}-600`
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

						<form onSubmit={handleAdvancedSearch} className='max-w-7xl mx-auto'>
							<div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 mb-6 sm:mb-8'>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8'>
									{/* Listing Type */}
									<div className='relative group'>
										<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
											{t.listingType}
										</label>
										<div className='relative'>
											<DollarSign className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
											<select
												value={advancedSearch.listing_type}
												onChange={e =>
													setAdvancedSearch({
														...advancedSearch,
														listing_type: e.target.value as ListingType | '',
													})
												}
												className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer'
											>
												<option value=''>{t.anyType}</option>
												<option value='sale'>{t.forSale}</option>
												<option value='rent'>{t.forRent}</option>
												<option value='daily_rent'>{t.forDailyRent}</option>
											</select>
											<ChevronDown className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none' />
										</div>
									</div>

									{/* Location - State */}
									<div className='relative group'>
										<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
											{t.location}
										</label>
										<div className='relative'>
											<MapPin className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
											<select
												value={advancedSearch.state_id || ''}
												onChange={e => {
													const stateId = e.target.value
														? parseInt(e.target.value)
														: undefined
													setAdvancedSearch({
														...advancedSearch,
														state_id: stateId,
														city_id: undefined,
														district_id: undefined,
													})
												}}
												className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer'
											>
												<option value=''>{t.allStates}</option>
												{states.map(state => (
													<option key={state.id} value={state.id}>
														{getTranslatedStateName(state.name, language)}
													</option>
												))}
											</select>
											<ChevronDown className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none' />
										</div>
									</div>

									{/* District Selection (for states that use districts like Yerevan) */}
									{selectedState?.uses_districts && (
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.district}
											</label>
											<div className='relative'>
												<Building2 className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
												<select
													value={advancedSearch.district_id || ''}
													onChange={e =>
														setAdvancedSearch({
															...advancedSearch,
															district_id: e.target.value
																? parseInt(e.target.value)
																: undefined,
														})
													}
													className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer disabled:bg-gray-50'
													disabled={!advancedSearch.state_id}
												>
													<option value=''>{t.allDistricts}</option>
													{districts.map(district => (
														<option key={district.id} value={district.id}>
															{getTranslatedDistrictName(district, language)}
														</option>
													))}
												</select>
												<ChevronDown className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none' />
											</div>
										</div>
									)}

									{/* City Selection (for states that don't use districts) */}
									{selectedState && !selectedState.uses_districts && (
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.city}
											</label>
											<div className='relative'>
												<Building2 className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
												<select
													value={advancedSearch.city_id || ''}
													onChange={e =>
														setAdvancedSearch({
															...advancedSearch,
															city_id: e.target.value
																? parseInt(e.target.value)
																: undefined,
														})
													}
													className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer disabled:bg-gray-50'
													disabled={!advancedSearch.state_id}
												>
													<option value=''>{t.allCities}</option>
													{cities.map(city => (
														<option key={city.id} value={city.id}>
															{getTranslatedCityName(city.name, language)}
														</option>
													))}
												</select>
												<ChevronDown className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none' />
											</div>
										</div>
									)}

									{/* Min Price */}
									<div className='relative group'>
										<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
											{t.minPrice}
										</label>
										<div className='relative'>
											<DollarSign className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-500 transition-colors' />
											<input
												type='number'
												placeholder='0'
												value={advancedSearch.min_price}
												onChange={e =>
													setAdvancedSearch({
														...advancedSearch,
														min_price: e.target.value,
													})
												}
												className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
											/>
										</div>
									</div>

									{/* Max Price */}
									<div className='relative group'>
										<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
											{t.maxPrice}
										</label>
										<div className='relative'>
											<DollarSign className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-500 transition-colors' />
											<input
												type='number'
												placeholder={t.noLimit}
												value={advancedSearch.max_price}
												onChange={e =>
													setAdvancedSearch({
														...advancedSearch,
														max_price: e.target.value,
													})
												}
												className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
											/>
										</div>
									</div>

									{/* Area fields */}
									{(selectedPropertyType === 'house' ||
										selectedPropertyType === 'apartment' ||
										selectedPropertyType === 'commercial' ||
										!selectedPropertyType) && (
										<>
											{/* Min Area */}
											<div className='relative group'>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.minArea}
												</label>
												<div className='relative'>
													<Square className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-500 transition-colors' />
													<input
														type='number'
														placeholder='0'
														value={advancedSearch.min_area}
														onChange={e =>
															setAdvancedSearch({
																...advancedSearch,
																min_area: e.target.value,
															})
														}
														className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
													/>
												</div>
											</div>

											{/* Max Area */}
											<div className='relative group'>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.maxArea}
												</label>
												<div className='relative'>
													<Square className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-500 transition-colors' />
													<input
														type='number'
														placeholder={t.noLimit}
														value={advancedSearch.max_area}
														onChange={e =>
															setAdvancedSearch({
																...advancedSearch,
																max_area: e.target.value,
															})
														}
														className='w-full text-gray-600 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
													/>
												</div>
											</div>
										</>
									)}

									{/* Property type specific fields */}
									{getPropertyTypeFields()}
								</div>
							</div>

							<div className='flex flex-col gap-3 justify-center'>
								<button
									type='submit'
									className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-8 py-4 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5'
								>
									<Search className='w-5 h-5 mr-2' />
									{t.search} {t.properties}
								</button>
								<button
									type='button'
									onClick={clearAdvancedSearch}
									className='w-full bg-gray-100 text-gray-700 rounded-xl px-8 py-3 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center font-semibold border-2 border-gray-200 hover:border-gray-300'
								>
									<X className='w-5 h-5 mr-2' />
									{t.clearFilters}
								</button>
							</div>
						</form>
					</div>
				</div>
				{/* Recent Properties */}
				<section className='py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 relative overflow-hidden'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
						{loading ? (
							<div className='flex justify-center items-center h-64'>
								<div className='relative'>
									<div className='animate-spin rounded-full h-16 w-16 border-4 border-green-200'></div>
									<div className='animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0'></div>
								</div>
							</div>
						) : (
							<>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
									{Array.isArray(recentProperties) &&
										recentProperties.map((property, index) => (
											<div
												key={property.id}
												className='group relative transform hover:-translate-y-2 transition-all duration-300'
												style={{ animationDelay: `${index * 100}ms` }}
											>
												<PropertyCard property={property} />
											</div>
										))}
									{Array.isArray(recentProperties) &&
										recentProperties.length === 0 && (
											<div className='col-span-full text-center py-8 text-gray-500'>
												{t.noProperties}
											</div>
										)}
								</div>
							</>
						)}

						<div className='text-center'>
							<Link
								href={`/${language}/properties`}
								className='group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg relative overflow-hidden'
							>
								<span className='relative z-10 flex items-center'>
									<span className='mr-3'>🏡</span>
									{t.viewAll} {t.properties}
									<ArrowRight className='ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300' />
								</span>
							</Link>
						</div>
					</div>
				</section>
				{/* Property Types */}
				<section className='py-20 bg-white relative overflow-hidden'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
						<div className='text-center mb-16'>
							<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl'>
								<div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center'>
									<span className='text-2xl'>🏠</span>
								</div>
							</div>
							<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
								{t.browseByType}
							</h2>
							<p className='mt-4 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
								{t.browseDescription}
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
							{[
								{
									href: `/${language}/properties?property_type=house`,
									icon: Home,
									title: t.houses,
									color: 'blue',
									gradient: 'from-blue-500 to-blue-600',
									bgPattern: 'from-blue-50 to-blue-100',
								},
								{
									href: `/${language}/properties?property_type=apartment`,
									icon: Building2,
									title: t.apartments,
									color: 'emerald',
									gradient: 'from-emerald-500 to-emerald-600',
									bgPattern: 'from-emerald-50 to-emerald-100',
								},
								{
									href: `/${language}/properties?property_type=commercial`,
									icon: Landmark,
									title: t.commercial,
									color: 'purple',
									gradient: 'from-purple-500 to-purple-600',
									bgPattern: 'from-purple-50 to-purple-100',
								},
								{
									href: `/${language}/properties?property_type=land`,
									icon: Trees,
									title: t.land,
									color: 'amber',
									gradient: 'from-amber-500 to-amber-600',
									bgPattern: 'from-amber-50 to-amber-100',
								},
							].map((item, index) => (
								<Link
									key={item.href}
									href={item.href}
									className='group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 hover:border-gray-200 transform hover:-translate-y-3 hover:scale-105'
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<div
										className={`relative z-10 w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}
									>
										<item.icon className='w-10 h-10 text-white' />
									</div>

									<div className='relative z-10'>
										<h3 className='text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors'>
											{item.title}
										</h3>
									</div>

									{/* Hover arrow */}
									<div className='absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300'>
										<ArrowRight className={`w-4 h-4 text-${item.color}-600`} />
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
				{/* Call to Action */}
				<section className='py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden'>
					<div className='absolute inset-0'>
						<div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20'></div>
						<div className='absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse'></div>
						<div className='absolute top-32 right-20 w-48 h-48 border border-white/5 rounded-full animate-pulse animation-delay-1000'></div>
						<div className='absolute bottom-20 left-32 w-24 h-24 border border-white/15 rounded-full animate-pulse animation-delay-2000'></div>
						<div className='absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-600/10 to-pink-600/10 rounded-full'></div>
					</div>

					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
						{/* Icon */}
						<div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-8 shadow-2xl animate-bounce'>
							<span className='text-4xl'>🚀</span>
						</div>

						{/* Heading */}
						<h2 className='text-4xl md:text-6xl font-bold text-white mb-6 leading-tight'>
							{t.readyToFind}
							<span className='block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>
								{t.dreamProperty}
							</span>
						</h2>

						{/* Description */}
						<p className='mt-6 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10'>
							{t.readyDescription}
						</p>

						{/* Stats row */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto'>
							<div className='text-center'>
								<div className='text-3xl font-bold text-white mb-2'>24/7</div>
								<div className='text-blue-200 text-sm'>{t.customerSupport}</div>
							</div>
							<div className='text-center'>
								<div className='text-3xl font-bold text-white mb-2'>100%</div>
								<div className='text-blue-200 text-sm'>
									{t.verifiedListings}
								</div>
							</div>
							<div className='text-center'>
								<div className='text-3xl font-bold text-white mb-2'>0%</div>
								<div className='text-blue-200 text-sm'>{t.hiddenFees}</div>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
							<Link
								href={`/${language}/properties`}
								className='group inline-flex items-center px-10 py-5 bg-gradient-to-r from-white to-gray-100 text-blue-900 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-lg relative overflow-hidden min-w-[200px]'
							>
								<span className='relative z-10 flex items-center group-hover:text-white transition-colors duration-300'>
									<span className='mr-3'>🏠</span>
									{t.startBrowsing}
									<ArrowRight className='ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300' />
								</span>
							</Link>

							<Link
								href={`/${language}/contact`}
								className='group inline-flex items-center px-10 py-5 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-lg backdrop-blur-sm min-w-[200px]'
							>
								<span className='mr-3'>📞</span>
								{t.contactExpert}
								<ArrowRight className='ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
							</Link>
						</div>
					</div>
				</section>
			</div>
		)
}