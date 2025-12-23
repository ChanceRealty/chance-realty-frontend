// PropertiesContent.tsx - Updated with is_top, is_urgently filters and custom sorting
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/app/_components/PropertyCard'
import PropertyFilter from '@/app/_components/PropertyFilter'
import {
	Property,
	PropertyFilter as FilterType,
	PropertyType,
	ListingType,
} from '@/types/property'
import { getProperties } from '@/services/propertyService'

import {
	Loader2,
	Grid3X3,
	List,
	SlidersHorizontal,
	ChevronDown,
	Crown,
	Flame,
	AlertCircle,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/translations/translations'
import { FaVrCardboard } from 'react-icons/fa'

type PropertyCardProps = {
	property?: Property
	onFavoriteClick?: (property: Property) => void
	isFavorited?: boolean
	variant?: 'default' | 'featured'
}

const PROPERTIES_PER_PAGE = 30

export default function PropertiesContent({}: PropertyCardProps) {
	const { language } = useLanguage()

	const searchParams = useSearchParams()
	const [allProperties, setAllProperties] = useState<Property[]>([])
	const [displayedProperties, setDisplayedProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [showFilters, setShowFilters] = useState(false)
	const [sortBy, setSortBy] = useState<'price' | 'created_at' | 'views'>(
		'created_at'
	)
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [showExclusiveOnly, setShowExclusiveOnly] = useState(false)
	const [showSortMenu, setShowSortMenu] = useState(false)
	const [show3DOnly, setShow3DOnly] = useState(false)
	const [showTopOnly, setShowTopOnly] = useState(false)
	const [showUrgentlyOnly, setShowUrgentlyOnly] = useState(false)

	useEffect(() => {
		const has3d = searchParams.get('3d') === 'true'
		const hasTop = searchParams.get('top') === 'true'
		const hasUrgently = searchParams.get('urgently') === 'true'
		setShow3DOnly(has3d)
		setShowTopOnly(hasTop)
		setShowUrgentlyOnly(hasUrgently)
	}, [searchParams])

	// Initialize filter from URL params
	const [filter, setFilter] = useState<FilterType>(() => {
		const initialFilter: FilterType = {
			page: 1,
			limit: 12,
		}

		const getArrayFromParams = (key: string): number[] | undefined => {
			const all = searchParams.getAll(key)
			if (all.length === 0) return undefined
			if (all.length === 1) return undefined
			return all.map(v => parseInt(v)).filter(v => !isNaN(v))
		}

		// Parse ALL URL parameters
		const property_type = searchParams.get('property_type')
		const listing_type = searchParams.get('listing_type')
		const min_price = searchParams.get('min_price')
		const max_price = searchParams.get('max_price')
		const exclusive = searchParams.get('exclusive')
		const building_type = searchParams.get('building_type')
		const business_type = searchParams.get('business_type')

		const bedrooms = searchParams.get('bedrooms')
		const bathrooms = searchParams.get('bathrooms')
		const floors = searchParams.get('floors')
		const floor = searchParams.get('floor')
		const total_floors = searchParams.get('total_floors')
		const ceiling_height = searchParams.get('ceiling_height')
		const min_lot_size_sqft = searchParams.get('min_lot_size_sqft')
		const max_lot_size_sqft = searchParams.get('max_lot_size_sqft')
		const min_area_acres = searchParams.get('min_area_acres')
		const max_area_acres = searchParams.get('max_area_acres')
		const min_area_sqft = searchParams.get('min_area_sqft')
		const max_area_sqft = searchParams.get('max_area_sqft')
		const stateIds = getArrayFromParams('state_id')
		const cityIds = getArrayFromParams('city_id')
		const districtIds = getArrayFromParams('district_id')

		if (property_type)
			initialFilter.property_type = property_type as PropertyType
		if (listing_type) initialFilter.listing_type = listing_type as ListingType
		if (stateIds && stateIds.length > 0) {
			initialFilter.state_id = stateIds
		} else {
			const singleStateId = searchParams.get('state_id')
			if (singleStateId) initialFilter.state_id = parseInt(singleStateId)
		}

		if (cityIds && cityIds.length > 0) {
			initialFilter.city_id = cityIds
		} else {
			const singleCityId = searchParams.get('city_id')
			if (singleCityId) initialFilter.city_id = parseInt(singleCityId)
		}

		if (districtIds && districtIds.length > 0) {
			initialFilter.district_id = districtIds
		} else {
			const singleDistrictId = searchParams.get('district_id')
			if (singleDistrictId)
				initialFilter.district_id = parseInt(singleDistrictId)
		}

		if (min_price) initialFilter.min_price = parseFloat(min_price)
		if (max_price) initialFilter.max_price = parseFloat(max_price)
		if (exclusive === 'true') setShowExclusiveOnly(true)
		if (building_type) initialFilter.building_type_id = parseInt(building_type)
		if (business_type) initialFilter.business_type = business_type

		if (bedrooms) initialFilter.bedrooms = parseInt(bedrooms)
		if (bathrooms) initialFilter.bathrooms = parseFloat(bathrooms)
		if (floors) initialFilter.floors = parseInt(floors)
		if (floor) initialFilter.floor = parseInt(floor)
		if (total_floors) initialFilter.total_floors = parseInt(total_floors)
		if (ceiling_height)
			initialFilter.ceiling_height = parseFloat(ceiling_height)
		if (min_lot_size_sqft)
			initialFilter.min_lot_size_sqft = parseInt(min_lot_size_sqft)
		if (max_lot_size_sqft)
			initialFilter.max_lot_size_sqft = parseInt(max_lot_size_sqft)
		if (min_area_sqft) initialFilter.min_area_sqft = parseInt(min_area_sqft)
		if (max_area_sqft) initialFilter.max_area_sqft = parseInt(max_area_sqft)
		if (min_area_acres)
			initialFilter.min_area_acres = parseFloat(min_area_acres)
		if (max_area_acres)
			initialFilter.max_area_acres = parseFloat(max_area_acres)
		return initialFilter
	})

	useEffect(() => {
		setCurrentPage(1)
		setDisplayedProperties([])
		setAllProperties([])
		fetchProperties()
	}, [
		filter.property_type,
		filter.listing_type,
		filter.state_id,
		filter.city_id,
		filter.district_id,
		filter.min_price,
		filter.max_price,
		filter.bedrooms,
		filter.bathrooms,
		filter.floors,
		filter.floor,
		filter.total_floors,
		filter.ceiling_height,
		filter.min_lot_size_sqft,
		filter.max_lot_size_sqft,
		filter.min_area_sqft,
		filter.max_area_sqft,
		filter.min_area_acres,
		filter.max_area_acres,
		filter.building_type_id,
		filter.business_type,
		showExclusiveOnly,
		show3DOnly,
		showTopOnly,
		showUrgentlyOnly,
		sortBy,
		sortOrder,
	])

	// Custom sorting function for properties
	const customSortProperties = (properties: Property[]): Property[] => {
		// Separate properties by type
		const topProperties = properties.filter(p => p.is_top).slice(0, 6)
		const urgentlyProperties = properties
			.filter(p => !p.is_top && p.is_urgently)
			.slice(0, 6)
		const exclusiveProperties = properties
			.filter(p => !p.is_top && !p.is_urgently && p.is_exclusive)
			.slice(0, 6)
		const remainingProperties = properties.filter(
			p => !p.is_top && !p.is_urgently && !p.is_exclusive
		)

		// Sort remaining properties based on user preference
		const sortedRemaining = remainingProperties.sort((a, b) => {
			if (sortBy === 'price') {
				return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
			} else if (sortBy === 'views') {
				return sortOrder === 'asc' ? a.views - b.views : b.views - a.views
			} else {
				// created_at
				const aTime = new Date(a.created_at).getTime()
				const bTime = new Date(b.created_at).getTime()
				return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
			}
		})

		// Combine in order: top -> urgently -> exclusive -> remaining
		return [
			...topProperties,
			...urgentlyProperties,
			...exclusiveProperties,
			...sortedRemaining,
		]
	}

	const fetchProperties = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const data = await getProperties({
				...filter,
				sort_by: sortBy,
				sort_order: sortOrder,
				limit: 1000,
				is_exclusive: showExclusiveOnly ? true : undefined,
				show_hidden: false,
			})

			if (data && Array.isArray(data) && data.length > 0) {
				const visibleProperties = data.filter(property => !property.is_hidden)

				let filteredProperties = showExclusiveOnly
					? visibleProperties.filter(property => property.is_exclusive)
					: visibleProperties

				if (show3DOnly) {
					filteredProperties = filteredProperties.filter(
						property => property.url_3d && property.url_3d.trim() !== ''
					)
				}

				if (showTopOnly) {
					filteredProperties = filteredProperties.filter(
						property => property.is_top
					)
				}

				if (showUrgentlyOnly) {
					filteredProperties = filteredProperties.filter(
						property => property.is_urgently
					)
				}

				// Apply custom sorting
				const sortedProperties = customSortProperties(filteredProperties)

				setAllProperties(sortedProperties)
				setDisplayedProperties(sortedProperties.slice(0, PROPERTIES_PER_PAGE))
			} else {
				setAllProperties([])
				setDisplayedProperties([])
			}
		} catch (err) {
			console.error('Error in fetchProperties:', err)
			setError('Failed to load properties. Please try again.')
			setAllProperties([])
			setDisplayedProperties([])
		} finally {
			setLoading(false)
		}
	}, [
		filter,
		sortBy,
		sortOrder,
		showExclusiveOnly,
		show3DOnly,
		showTopOnly,
		showUrgentlyOnly,
	])

	const propertyListRef = useRef<HTMLDivElement>(null)

	const scrollToTop = () => {
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			const mainContent =
				document.querySelector('main') || document.querySelector('.max-w-7xl')
			if (mainContent) {
				mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}
		}, 100)
	}

	const goToNextPage = () => {
		if (currentPage * PROPERTIES_PER_PAGE < allProperties.length) {
			const nextPage = currentPage + 1
			const startIndex = (nextPage - 1) * PROPERTIES_PER_PAGE
			const endIndex = startIndex + PROPERTIES_PER_PAGE
			setDisplayedProperties(allProperties.slice(startIndex, endIndex))
			setCurrentPage(nextPage)
			scrollToTop()
		}
	}

	const goToPreviousPage = () => {
		if (currentPage > 1) {
			const prevPage = currentPage - 1
			const startIndex = (prevPage - 1) * PROPERTIES_PER_PAGE
			const endIndex = startIndex + PROPERTIES_PER_PAGE
			setDisplayedProperties(allProperties.slice(startIndex, endIndex))
			setCurrentPage(prevPage)
			scrollToTop()
		}
	}

	const totalPages = Math.ceil(allProperties.length / PROPERTIES_PER_PAGE)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			if (showSortMenu && !target.closest('.sort-dropdown-container')) {
				setShowSortMenu(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [showSortMenu])

	const handleFilterChange = (newFilter: FilterType) => {
		setFilter(newFilter)
		setCurrentPage(1)
	}

	const handleSortChange = (
		newSortBy: 'price' | 'created_at' | 'views',
		newSortOrder: 'asc' | 'desc'
	) => {
		setSortBy(newSortBy)
		setSortOrder(newSortOrder)
		setCurrentPage(1)
	}

	const getSortLabel = (sortType: 'price' | 'created_at' | 'views') => {
		const labels = {
			price: {
				hy: 'Գին',
				en: 'Price',
				ru: 'Цена',
			},
			created_at: {
				hy: 'Ամսաթիվ',
				en: 'Date',
				ru: 'Дата',
			},
			views: {
				hy: 'Դիտումներ',
				en: 'Views',
				ru: 'Просмотры',
			},
		}
		return labels[sortType][language]
	}

	const handleExclusiveToggle = () => {
		setShowExclusiveOnly(!showExclusiveOnly)
		setCurrentPage(1)
	}

	const handle3DToggle = () => {
		setShow3DOnly(!show3DOnly)
		setCurrentPage(1)
	}

	const handleTopToggle = () => {
		setShowTopOnly(!showTopOnly)
		setCurrentPage(1)
	}

	const handleUrgentlyToggle = () => {
		setShowUrgentlyOnly(!showUrgentlyOnly)
		setCurrentPage(1)
	}


	const getFilterSummary = () => {
		const summary = []
		if (filter.property_type) summary.push(filter.property_type)
		if (filter.listing_type) summary.push(filter.listing_type.replace('_', ' '))
		if (filter.min_price || filter.max_price) {
			const priceRange = `${filter.min_price || 0} - ${filter.max_price || '∞'}`
			summary.push(priceRange)
		}
		if (showExclusiveOnly) summary.push('Exclusive Only')
		if (showTopOnly) summary.push('Top Only')
		if (showUrgentlyOnly) summary.push('Urgently Only')
		return summary.join(', ') || 'All properties'
	}

	// Helper function to get section title
	const getSectionTitle = (type: 'top' | 'urgently' | 'exclusive') => {
		const titles = {
			top: {
				hy: 'Տոփ հայտարարություններ',
				en: 'Top Properties',
				ru: 'Топ объявления',
			},
			urgently: {
				hy: 'Շտապ հայտարարություններ',
				en: 'Urgent Properties',
				ru: 'Срочные объявления',
			},
			exclusive: {
				hy: 'Էքսկլյուզիվ հայտարարություններ',
				en: 'Exclusive Properties',
				ru: 'Эксклюзивные объявления',
			},
		}
		return titles[type][language]
	}

	// Group properties by type for display
	const groupedProperties = {
		top: displayedProperties.filter(p => p.is_top),
		urgently: displayedProperties.filter(p => !p.is_top && p.is_urgently),
		exclusive: displayedProperties.filter(
			p => !p.is_top && !p.is_urgently && p.is_exclusive
		),
		regular: displayedProperties.filter(
			p => !p.is_top && !p.is_urgently && !p.is_exclusive
		),
	}

	return (
		<div className='min-h-screen bg-white'>
			{/* Header Section */}
			<div className='bg-white shadow-lg'>
				<div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
						<div className='mb-6 lg:mb-0'>
							<div className='flex items-center'>
								<h1 className='text-[26px] font-bold text-gray-900'>
									{t('properties')}
								</h1>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Controls Bar */}
			<div className='bg-white border-b border-gray-100 shadow-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3 flex-wrap'>
							<button
								onClick={handleTopToggle}
								className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-2 ${
									showTopOnly
										? 'border-yellow-300 bg-yellow-50 text-yellow-700 shadow-md'
										: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<Flame className='w-4 h-4' />
								<span className='text-sm'>
									{language === 'hy'
										? 'Միայն ՏՈՊ'
										: language === 'ru'
										? 'Только ТОП'
										: 'Top Only'}
								</span>
								{showTopOnly && (
									<div className='w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-xs'>✓</span>
									</div>
								)}
							</button>

							<button
								onClick={handleUrgentlyToggle}
								className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-2 ${
									showUrgentlyOnly
										? 'border-red-300 bg-red-50 text-red-700 shadow-md'
										: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<AlertCircle className='w-4 h-4' />
								<span className='text-sm'>
									{language === 'hy'
										? 'Միայն ՇՏԱՊ'
										: language === 'ru'
										? 'Только СРОЧНО'
										: 'Urgently Only'}
								</span>
								{showUrgentlyOnly && (
									<div className='w-4 h-4 bg-red-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-xs'>✓</span>
									</div>
								)}
							</button>

							<button
								onClick={handleExclusiveToggle}
								className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-2 ${
									showExclusiveOnly
										? 'border-purple-300 bg-purple-50 text-purple-700 shadow-md'
										: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<Crown className='w-4 h-4' />
								<span className='text-sm'>
									{language === 'hy'
										? 'Միայն Էքսկլյուզիվ'
										: language === 'ru'
										? 'Только Эксклюзив'
										: 'Exclusive Only'}
								</span>
								{showExclusiveOnly && (
									<div className='w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-xs'>✓</span>
									</div>
								)}
							</button>

							<button
								onClick={handle3DToggle}
								className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-2 ${
									show3DOnly
										? 'border-blue-300 bg-blue-50 text-blue-700 shadow-md'
										: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
								}`}
							>
								<FaVrCardboard className='w-4 h-4' />
								<span className='text-sm'>
									{language === 'hy'
										? 'Միայն 3D'
										: language === 'ru'
										? 'Только 3D'
										: '3D Only'}
								</span>
								{show3DOnly && (
									<div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-xs'>✓</span>
									</div>
								)}
							</button>
						</div>

						{/* Controls: Sort + View Mode */}
						<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto'>
							{/* Sort Dropdown */}
							<div className='relative w-full sm:w-auto sort-dropdown-container'>
								<button
									onClick={() => setShowSortMenu(!showSortMenu)}
									className='flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 w-full sm:w-auto min-w-[180px] shadow-sm hover:shadow-md group'
								>
									<div className='flex items-center gap-2'>
										<SlidersHorizontal className='w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors' />
										<span className='text-sm font-medium'>
											{getSortLabel(sortBy)}
											{sortOrder === 'asc' ? ' ↑' : ' ↓'}
										</span>
									</div>
									<ChevronDown
										className={`w-4 h-4 transition-transform duration-200 ${
											showSortMenu ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{/* Sort Options Dropdown */}
								{showSortMenu && (
									<div className='absolute top-full mt-2 w-full sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in'>
										<div className='p-2'>
											{/* Price Sort */}
											<div className='mb-1'>
												<div className='px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
													{language === 'hy'
														? 'Գին'
														: language === 'ru'
														? 'Цена'
														: 'Price'}
												</div>
												<button
													onClick={() => {
														handleSortChange('price', 'asc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'price' && sortOrder === 'asc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Ցածրից բարձր'
															: language === 'ru'
															? 'От низкой к высокой'
															: 'Low to High'}
													</span>
													{sortBy === 'price' && sortOrder === 'asc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
												<button
													onClick={() => {
														handleSortChange('price', 'desc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'price' && sortOrder === 'desc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Բարձրից ցածր'
															: language === 'ru'
															? 'От высокой к низкой'
															: 'High to Low'}
													</span>
													{sortBy === 'price' && sortOrder === 'desc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
											</div>

											<div className='my-2 border-t border-gray-100'></div>

											{/* Date Sort */}
											<div className='mb-1'>
												<div className='px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
													{language === 'hy'
														? 'Ամսաթիվ'
														: language === 'ru'
														? 'Дата'
														: 'Date'}
												</div>
												<button
													onClick={() => {
														handleSortChange('created_at', 'desc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'created_at' && sortOrder === 'desc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Նորից հին'
															: language === 'ru'
															? 'Новые первые'
															: 'Newest First'}
													</span>
													{sortBy === 'created_at' && sortOrder === 'desc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
												<button
													onClick={() => {
														handleSortChange('created_at', 'asc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'created_at' && sortOrder === 'asc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Հնից նոր'
															: language === 'ru'
															? 'Старые первые'
															: 'Oldest First'}
													</span>
													{sortBy === 'created_at' && sortOrder === 'asc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
											</div>

											<div className='my-2 border-t border-gray-100'></div>

											{/* Views Sort */}
											<div>
												<div className='px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
													{language === 'hy'
														? 'Դիտումներ'
														: language === 'ru'
														? 'Просмотры'
														: 'Views'}
												</div>
												<button
													onClick={() => {
														handleSortChange('views', 'desc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'views' && sortOrder === 'desc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Ամենաշատ դիտվածներ'
															: language === 'ru'
															? 'Самые просматриваемые'
															: 'Most Viewed'}
													</span>
													{sortBy === 'views' && sortOrder === 'desc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
												<button
													onClick={() => {
														handleSortChange('views', 'asc')
														setShowSortMenu(false)
													}}
													className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
														sortBy === 'views' && sortOrder === 'asc'
															? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
															: 'text-gray-700 hover:bg-gray-50'
													}`}
												>
													<span>
														{language === 'hy'
															? 'Ամենաքիչ դիտվածներ'
															: language === 'ru'
															? 'Наименее просматриваемые'
															: 'Least Viewed'}
													</span>
													{sortBy === 'views' && sortOrder === 'asc' && (
														<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
															<span className='text-white text-xs'>✓</span>
														</div>
													)}
												</button>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* View Mode Toggle */}
							<div className='flex items-center bg-gray-100 p-1 rounded-xl'>
								<button
									onClick={() => setViewMode('grid')}
									className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
										viewMode === 'grid'
											? 'bg-white text-blue-600 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									<Grid3X3 className='w-4 h-4' />
								</button>
								<button
									onClick={() => setViewMode('list')}
									className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
										viewMode === 'list'
											? 'bg-white text-blue-600 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									<List className='w-4 h-4' />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'>
				<div className='px-4 sm:px-0'>
					<div className='lg:flex lg:space-x-8'>
						{/* Filters Sidebar */}
						<div className='mb-8 lg:mb-0 lg:w-64 flex-shrink-0'>
							{/* Mobile Filter Toggle */}
							<div className='lg:hidden mb-4'>
								<button
									onClick={() => setShowFilters(!showFilters)}
									className='flex items-center justify-center w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200'
								>
									<SlidersHorizontal className='w-5 h-5 mr-2' />
									{t('filters')}
									<ChevronDown
										className={`w-4 h-4 ml-auto transition-transform ${
											showFilters ? 'rotate-180' : ''
										}`}
									/>
								</button>
							</div>

							{/* Filters Container */}
							<div
								className={`bg-white rounded-2xl lg:block ${
									showFilters ? 'block' : 'hidden'
								}`}
							>
								<PropertyFilter
									onFilterChange={handleFilterChange}
									initialFilter={filter}
								/>
							</div>
						</div>

						{/* Properties Section */}
						<div className='flex-1 flex flex-col mt-4'>
							{/* Properties Grid / Loading / Error */}
							<div className='relative min-h-[300px]'>
								{loading ? (
									<div className='flex flex-col justify-center items-center h-64 gap-4'>
										<Loader2 className='w-12 h-12 animate-spin text-blue-600' />
										<p className='text-blue-800 font-medium text-center'>
											{t('loadingPropertyText')}
										</p>
									</div>
								) : error ? (
									<div className='flex flex-col justify-center items-center h-64 text-center'>
										<p className='text-red-600 font-semibold mb-4'>{error}</p>
										<button
											onClick={fetchProperties}
											className='px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors'
										>
											{language === 'hy'
												? 'Փորձել կրկին'
												: language === 'ru'
												? 'Попробовать снова'
												: 'Retry'}
										</button>
									</div>
								) : displayedProperties.length === 0 ? (
									<div className='flex justify-center items-center h-64 text-gray-500'>
										<p>{t('noPropertiesFound')}</p>
									</div>
								) : (
									<div className='space-y-12'>
										{/* Top Properties Section */}
										{groupedProperties.top.length > 0 && (
											<div>
												<div className='flex items-center gap-3 mb-6 pb-3 border-b-2 border-yellow-200'>
													<Flame className='w-6 h-6 text-yellow-600' />
													<h2 className='text-[17px] font-bold text-gray-900'>
														{getSectionTitle('top')}
													</h2>
												</div>
												<div
													className={
														viewMode === 'grid'
															? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
															: 'grid grid-cols-1 gap-6'
													}
												>
													{groupedProperties.top.map(property => (
														<div key={property.id}>
															<PropertyCard property={property} />
														</div>
													))}
												</div>
											</div>
										)}

										{/* Urgently Properties Section */}
										{groupedProperties.urgently.length > 0 && (
											<div>
												<div className='flex items-center gap-3 mb-6 pb-3 border-b-2 border-red-200'>
													<AlertCircle className='w-6 h-6 text-red-600' />
													<h2 className='text-[17px] font-bold text-gray-900'>
														{getSectionTitle('urgently')}
													</h2>
												</div>
												<div
													className={
														viewMode === 'grid'
															? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
															: 'grid grid-cols-1 gap-6'
													}
												>
													{groupedProperties.urgently.map(property => (
														<div key={property.id}>
															<PropertyCard property={property} />
														</div>
													))}
												</div>
											</div>
										)}

										{/* Exclusive Properties Section */}
										{groupedProperties.exclusive.length > 0 && (
											<div>
												<div className='flex items-center gap-3 mb-6 pb-3 border-b-2 border-purple-200'>
													<Crown className='w-6 h-6 text-purple-600' />
													<h2 className='text-[17px] font-bold text-gray-900'>
														{getSectionTitle('exclusive')}
													</h2>
												</div>
												<div
													className={
														viewMode === 'grid'
															? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
															: 'grid grid-cols-1 gap-6'
													}
												>
													{groupedProperties.exclusive.map(property => (
														<div key={property.id}>
															<PropertyCard property={property} />
														</div>
													))}
												</div>
											</div>
										)}

										{/* Regular Properties Section */}
										{groupedProperties.regular.length > 0 && (
											<div>
												{(groupedProperties.top.length > 0 ||
													groupedProperties.urgently.length > 0 ||
													groupedProperties.exclusive.length > 0) && (
													<div className='flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200'>
														<h2 className='text-[17px] font-bold text-gray-900'>
															{language === 'hy'
																? 'Սովորական հայտարարություններ'
																: language === 'ru'
																? 'Другие объявления'
																: 'Other Properties'}
														</h2>
													</div>
												)}
												<div
													className={
														viewMode === 'grid'
															? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
															: 'grid grid-cols-1 gap-6'
													}
												>
													{groupedProperties.regular.map(property => (
														<div key={property.id}>
															<PropertyCard property={property} />
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								)}

								{/* Pagination Controls */}
								{!loading &&
									!error &&
									displayedProperties.length > 0 &&
									totalPages > 1 && (
										<div className='mt-12 flex flex-col items-center gap-4'>
											{/* Page info */}
											<div className='text-sm text-gray-600'>
												{language === 'hy'
													? `Էջ ${currentPage} / ${totalPages}`
													: language === 'ru'
													? `Страница ${currentPage} из ${totalPages}`
													: `Page ${currentPage} of ${totalPages}`}
											</div>

											{/* Pagination buttons */}
											<div className='flex items-center gap-3'>
												<button
													onClick={goToPreviousPage}
													disabled={currentPage === 1}
													className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
														currentPage === 1
															? 'bg-gray-100 text-gray-400 cursor-not-allowed'
															: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
													}`}
												>
													{language === 'hy'
														? '← Նախորդ'
														: language === 'ru'
														? '← Предыдущая'
														: '← Previous'}
												</button>

												<button
													onClick={goToNextPage}
													disabled={currentPage >= totalPages}
													className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
														currentPage >= totalPages
															? 'bg-gray-100 text-gray-400 cursor-not-allowed'
															: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
													}`}
												>
													{language === 'hy'
														? 'Հաջորդ →'
														: language === 'ru'
														? 'Следующая →'
														: 'Next →'}
												</button>
											</div>
										</div>
									)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Add custom CSS for animations */}
			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slideInUp {
					from {
						opacity: 0;
						transform: translateY(30px) scale(0.95);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.6s ease-out forwards;
					opacity: 0;
				}

				.property-card-animate {
					animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
					opacity: 0;
				}
			`}</style>
		</div>
	)
}
