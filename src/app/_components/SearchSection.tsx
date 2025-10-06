'use client'
import { useState, useEffect, useRef } from 'react'
import {
	PropertyType,
	ListingType,
	State,
	City,
	District,
} from '@/types/property'
import {
	getCitiesByState,
	getDistrictsByState,
	getStates,
	getTranslatedCityName,
	getTranslatedField,
	getTranslatedStateName,
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
	const [selectedState, setSelectedState] = useState<State | null>(null)

	const modalRef = useRef<HTMLDivElement>(null)

	const [selectedPropertyType, setSelectedPropertyType] = useState<
		PropertyType | ''
	>('')
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
		min_lot_size_sqft: '',
		max_lot_size_sqft: '',
		business_type: '',
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
		fetchStates()
	}, [])

	useEffect(() => {
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



	useEffect(() => {
		if (!showAdvancedModal) return

		const handleClickOutside = (event: MouseEvent) => {
			if (advancedButtonRef.current?.contains(event.target as Node)) {
				return
			}

			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
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
			min_lot_size_sqft: {
				hy: 'Նվազագույն հողատարածքի մակերես (մ²)',
				ru: 'Минимальный размер участка (м²)',
				en: 'Min. Lot Size (m²)',
			},
			max_lot_size_sqft: {
				hy: 'Առավելագույն հողատարածքի մակերես (մ²)',
				ru: 'Максимальный размер участка (м²)',
				en: 'Max. Lot Size (m²)',
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
			min_area_acres: {
				hy: 'Նվազագույն մակերես (մ²)',
				ru: 'Мин. Площадь (м²)',
				en: 'Min. Area (m²)',
			},
			max_area_acres: {
				hy: 'Առավելագույն մակերես (մ²)',
				ru: 'Максимальная площадь (м²)',
				en: 'Max. Area (m²)',
			},
		}
		return labels[key]?.[language] || key
	}

		const handleAdvancedSearch = (e: React.FormEvent) => {
			e.preventDefault()
			const params = new URLSearchParams()

			// Property Type & Listing Type
			if (selectedPropertyType)
				params.append('property_type', selectedPropertyType)
			if (advancedSearch.listing_type)
				params.append('listing_type', advancedSearch.listing_type)

			// Location
			if (advancedSearch.state_id)
				params.append('state_id', advancedSearch.state_id.toString())
			if (advancedSearch.city_id)
				params.append('city_id', advancedSearch.city_id.toString())
			if (advancedSearch.district_id)
				params.append('district_id', advancedSearch.district_id.toString())

			// Price
			if (advancedSearch.min_price)
				params.append('min_price', advancedSearch.min_price)
			if (advancedSearch.max_price)
				params.append('max_price', advancedSearch.max_price)

			// Common attributes (house & apartment)
			if (advancedSearch.bedrooms)
				params.append('bedrooms', advancedSearch.bedrooms)
			if (advancedSearch.bathrooms)
				params.append('bathrooms', advancedSearch.bathrooms)

			// Area attributes
			if (advancedSearch.min_area)
				params.append('min_area', advancedSearch.min_area)
			if (advancedSearch.max_area)
				params.append('max_area', advancedSearch.max_area)

			if (advancedSearch.floors) params.append('floors', advancedSearch.floors)
			if (advancedSearch.min_lot_size_sqft)
				params.append('min_lot_size_sqft', advancedSearch.min_lot_size_sqft)
			if (advancedSearch.max_lot_size_sqft)
				params.append('max_lot_size_sqft', advancedSearch.max_lot_size_sqft)

			if (advancedSearch.floor) params.append('floor', advancedSearch.floor)
			if (advancedSearch.total_floors)
				params.append('total_floors', advancedSearch.total_floors)

			if (advancedSearch.ceiling_height)
				params.append('ceiling_height', advancedSearch.ceiling_height)

			if (advancedSearch.business_type)
				params.append('business_type', advancedSearch.business_type)

			if (advancedSearch.min_area_acres)
				params.append('min_area_acres', advancedSearch.min_area_acres)
			if (advancedSearch.max_area_acres)
				params.append('max_area_acres', advancedSearch.max_area_acres)

			// Features
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
			min_area: '',
			max_area: '',
			state_id: undefined,
			city_id: undefined,
			district_id: undefined,
			floors: '',
			floor: '',
			total_floors: '',
			ceiling_height: '',
			min_lot_size_sqft: '',
			max_lot_size_sqft: '',
			business_type: '',
			min_area_acres: '',
			max_area_acres: '',
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
							<div className='relative'>
								<Trees className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.min_lot_size_sqft}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											min_lot_size_sqft: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('max_lot_size_sqft')}
							</label>
							<div className='relative'>
								<Trees className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.max_lot_size_sqft}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											max_lot_size_sqft: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
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
					</>
				)

			case 'commercial':
				return (
					<>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('business_type')}
							</label>
							<div className='relative'>
								<Landmark className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
								<select
									value={advancedSearch.business_type}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											business_type: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-8 md:pr-10 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer'
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
								</select>
								<ChevronDown className='absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none' />
							</div>
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
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('min_area_acres')}
							</label>
							<div className='relative'>
								<Trees className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.min_area_acres}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											min_area_acres: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>
						<div className='relative group'>
							<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
								{getAttributeLabel('max_area_acres')}
							</label>
							<div className='relative'>
								<Trees className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
								<input
									type='number'
									placeholder={t.any}
									value={advancedSearch.max_area_acres}
									onChange={e =>
										setAdvancedSearch({
											...advancedSearch,
											max_area_acres: e.target.value,
										})
									}
									className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
									min='0'
								/>
							</div>
						</div>
					</>
				)

			default:
				return null
		}
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
			'name' in district &&
			typeof (district as { name?: unknown }).name === 'string'
		) {
			return (district as { name: string }).name
		} else {
			return ''
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
							className='w-32 sm:w-48 pl-2 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200'
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
				<div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
					<div
						ref={modalRef}
						className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200'
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
												<KeyRound  className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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

										{/* Location - State */}
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.location}
											</label>
											<div className='relative'>
												<MapPin className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
													className='w-full text-gray-600 pl-10 md:pl-12 pr-8 md:pr-10 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer'
												>
													<option value=''>{t.allStates}</option>
													{states.map(state => (
														<option key={state.id} value={state.id}>
															{getTranslatedStateName(state.name, language)}
														</option>
													))}
												</select>
												<ChevronDown className='absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none' />
											</div>
										</div>

										{/* District Selection */}
										{selectedState?.uses_districts && (
											<div className='relative group'>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.district}
												</label>
												<div className='relative'>
													<Building2 className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
														className='w-full text-gray-600 pl-10 md:pl-12 pr-8 md:pr-10 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer disabled:bg-gray-50'
														disabled={!advancedSearch.state_id}
													>
														<option value=''>{t.allDistricts}</option>
														{districts.map(district => (
															<option key={district.id} value={district.id}>
																{getTranslatedDistrictName(district, language)}
															</option>
														))}
													</select>
													<ChevronDown className='absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none' />
												</div>
											</div>
										)}

										{/* City Selection */}
										{selectedState && !selectedState.uses_districts && (
											<div className='relative group'>
												<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
													{t.city}
												</label>
												<div className='relative'>
													<Building2 className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors' />
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
														className='w-full text-gray-600 pl-10 md:pl-12 pr-8 md:pr-10 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer disabled:bg-gray-50'
														disabled={!advancedSearch.state_id}
													>
														<option value=''>{t.allCities}</option>
														{cities.map(city => (
															<option key={city.id} value={city.id}>
																{getTranslatedCityName(city.name, language)}
															</option>
														))}
													</select>
													<ChevronDown className='absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none' />
												</div>
											</div>
										)}

										{/* Min Price */}
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.minPrice}
											</label>
											<div className='relative'>
												<DollarSign className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
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
													className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
												/>
											</div>
										</div>

										{/* Max Price */}
										<div className='relative group'>
											<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
												{t.maxPrice}
											</label>
											<div className='relative'>
												<DollarSign className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
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
													className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
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
														<Maximize className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
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
															className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
														/>
													</div>
												</div>

												{/* Max Area */}
												<div className='relative group'>
													<label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
														{t.maxArea}
													</label>
													<div className='relative'>
														<Maximize className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors' />
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
															className='w-full text-gray-600 pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
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
										<span className='ml-2 sm:hidden'>Clear</span>
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
