// PropertiesContent.tsx - Updated with fixed sortBy function
'use client'

import { useState, useCallback, useEffect } from 'react'
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
	Filter,
	Grid3X3,
	List,
	SlidersHorizontal,
	MapPin,
	ChevronDown,
	Crown,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/translations/translations'

type PropertyCardProps = {
	property?: Property
	onFavoriteClick?: (property: Property) => void
	isFavorited?: boolean
	variant?: 'default' | 'featured'
}

export default function PropertiesContent({}: PropertyCardProps) {
	const { language } = useLanguage()

	const searchParams = useSearchParams()
	const [properties, setProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [showFilters, setShowFilters] = useState(false)
	const [sortBy, setSortBy] = useState<'price' | 'created_at' | 'views'>(
		'created_at'
	)
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [showExclusiveOnly, setShowExclusiveOnly] = useState(false)
	const [showSortMenu, setShowSortMenu] = useState(false)

	// Initialize filter from URL params
	const [filter, setFilter] = useState<FilterType>(() => {
		const initialFilter: FilterType = {
			page: 1,
			limit: 12,
		}

		// Parse ALL URL parameters
		const property_type = searchParams.get('property_type')
		const listing_type = searchParams.get('listing_type')
		const state_id = searchParams.get('state_id')
		const city_id = searchParams.get('city_id')
		const district_id = searchParams.get('district_id')
		const min_price = searchParams.get('min_price')
		const max_price = searchParams.get('max_price')
		const exclusive = searchParams.get('exclusive')

		const bedrooms = searchParams.get('bedrooms')
		const bathrooms = searchParams.get('bathrooms')
		const floors = searchParams.get('floors')
		const floor = searchParams.get('floor')
		const total_floors = searchParams.get('total_floors')
		const ceiling_height = searchParams.get('ceiling_height')
		const min_lot_size_sqft = searchParams.get('min_lot_size_sqft')
		const max_lot_size_sqft = searchParams.get('max_lot_size_sqft')
		const business_type = searchParams.get('business_type')
		const min_area_acres = searchParams.get('min_area_acres')
		const max_area_acres = searchParams.get('max_area_acres')
		const min_area_sqft = searchParams.get('min_area_sqft')
		const max_area_sqft = searchParams.get('max_area_sqft')

		if (property_type)
			initialFilter.property_type = property_type as PropertyType
		if (listing_type) initialFilter.listing_type = listing_type as ListingType
		if (state_id) initialFilter.state_id = parseInt(state_id)
		if (city_id) initialFilter.city_id = parseInt(city_id)
		if (district_id) initialFilter.district_id = parseInt(district_id)
		if (min_price) initialFilter.min_price = parseFloat(min_price)
		if (max_price) initialFilter.max_price = parseFloat(max_price)
		if (exclusive === 'true') setShowExclusiveOnly(true)

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
		if (business_type) initialFilter.business_type = business_type
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
		filter.business_type,
		showExclusiveOnly,
	])

	const fetchProperties = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const data = await getProperties({
				...filter,
				page: currentPage,
				sort_by: sortBy,
				sort_order: sortOrder,
				limit: 50,
				is_exclusive: showExclusiveOnly ? true : undefined,
				show_hidden: false,
			})


			if (data && Array.isArray(data) && data.length > 0) {
				const visibleProperties = data.filter(property => !property.is_hidden)

				const filteredProperties = showExclusiveOnly
					? visibleProperties.filter(property => property.is_exclusive)
					: visibleProperties

				setProperties(filteredProperties)

				const calculatedPages = Math.max(
					1,
					Math.ceil(filteredProperties.length / (filter.limit || 12))
				)
				setTotalPages(calculatedPages)
			} else {
				setProperties([])
				setTotalPages(1)
			}
		} catch (err) {
			console.error('Error in fetchProperties:', err)
			setError('Failed to load properties. Please try again.')
			setProperties([])
			setTotalPages(1)
		} finally {
			setLoading(false)
		}
	}, [currentPage, filter, sortBy, sortOrder, showExclusiveOnly])

	useEffect(() => {
		fetchProperties()
	}, [fetchProperties])

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

	// const handlePageChange = (page: number) => {
	// 	setCurrentPage(page)
	// 	window.scrollTo({ top: 0, behavior: 'smooth' })
	// }

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

	useEffect(() => {
		fetchProperties()
	}, [currentPage, sortBy, sortOrder])

	const hasActiveFilters = () => {
		return (
			Object.keys(filter).some(
				key =>
					key !== 'page' && key !== 'limit' && filter[key as keyof FilterType]
			) || showExclusiveOnly
		)
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
		return summary.join(', ') || 'All properties'
	}

	// const formatPrice = (price: number, listingType: string) => {
	// 	const formatted = new Intl.NumberFormat('en-US', {
	// 		style: 'currency',
	// 		currency: 'USD',
	// 		maximumFractionDigits: 0,
	// 	}).format(price)

	// 	switch (listingType) {
	// 		case 'rent':
	// 			return `${formatted}/month`
	// 		case 'daily_rent':
	// 			return `${formatted}/day`
	// 		default:
	// 			return formatted
	// 	}
	// }

	// const formatLocalizedDate = (
	// 	date: string | Date,
	// 	language: 'hy' | 'en' | 'ru'
	// ) => {
	// 	const dateObj = new Date(date)

	// 	const monthNames = {
	// 		hy: [
	// 			'Հունվար',
	// 			'Փետրվար',
	// 			'Մարտ',
	// 			'Ապրիլ',
	// 			'Մայիս',
	// 			'Հունիս',
	// 			'Հուլիս',
	// 			'Օգոստոս',
	// 			'Սեպտեմբեր',
	// 			'Հոկտեմբեր',
	// 			'Նոյեմբեր',
	// 			'Դեկտեմբեր',
	// 		],
	// 		en: [
	// 			'January',
	// 			'February',
	// 			'March',
	// 			'April',
	// 			'May',
	// 			'June',
	// 			'July',
	// 			'August',
	// 			'September',
	// 			'October',
	// 			'November',
	// 			'December',
	// 		],
	// 		ru: [
	// 			'Январь',
	// 			'Февраль',
	// 			'Март',
	// 			'Апрель',
	// 			'Май',
	// 			'Июнь',
	// 			'Июль',
	// 			'Август',
	// 			'Сентябрь',
	// 			'Октябрь',
	// 			'Ноябрь',
	// 			'Декабрь',
	// 		],
	// 	}

	// 	const day = dateObj.getDate()
	// 	const month = monthNames[language][dateObj.getMonth()]
	// 	const year = dateObj.getFullYear()

	// 	return `${day} ${month} ${year}`
	// }

	return (
		<div className='min-h-screen bg-white'>
			{/* Header Section */}
			<div className='bg-white shadow-lg border-b border-gray-100'>
				<div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
						<div className='mb-6 lg:mb-0'>
							<div className='flex items-center'>
								<h1 className='text-[26px] font-bold text-gray-900'>
									{t('properties')}
								</h1>
							</div>
						</div>
						{hasActiveFilters() && (
							<div className='mt-2 flex items-center text-sm text-gray-500'>
								<Filter className='w-4 h-4 mr-2' />
								<span>
									{t('filteredBy')}: {getFilterSummary()}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Controls Bar */}
			<div className='bg-white border-b border-gray-100 shadow-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<button
								onClick={handleExclusiveToggle}
								className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 flex items-center gap-2 ${
									showExclusiveOnly
										? 'border-red-300 bg-red-50 text-red-700 shadow-md'
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
									<div className='w-4 h-4 bg-red-500 rounded-full flex items-center justify-center'>
										<span className='text-white text-xs'>✓</span>
									</div>
								)}
							</button>
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
									{hasActiveFilters() && (
										<span className='ml-2 w-2 h-2 bg-blue-500 rounded-full'></span>
									)}
									<ChevronDown
										className={`w-4 h-4 ml-auto transition-transform ${
											showFilters ? 'rotate-180' : ''
										}`}
									/>
								</button>
							</div>

							{/* Filters Container */}
							<div className='bg-white rounded-2xl'>
								<PropertyFilter
									onFilterChange={handleFilterChange}
									initialFilter={filter}
								/>
							</div>
						</div>

						{/* Properties Section */}
						<div className='flex-1 flex flex-col'>
							{/* Results Summary + ViewMode Toggle */}
							<div className='mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 gap-4'>
								{/* Summary Info */}
								<div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
									<div className='flex items-center text-sm text-gray-600'>
										<MapPin className='w-4 h-4 mr-2 text-blue-500' />
										<span className='font-medium'>
											{properties.length} {t('propertiesFound')}
										</span>
									</div>
									{hasActiveFilters() && (
										<div className='flex items-center text-sm text-blue-600'>
											<Filter className='w-4 h-4 mr-1' />
											<span>{t('filteredResults')}</span>
										</div>
									)}
									{showExclusiveOnly && (
										<div className='flex items-center text-sm text-red-600'>
											<Crown className='w-4 h-4 mr-1' />
											<span>
												{language === 'hy'
													? 'Միայն Էքսկլյուզիվ'
													: language === 'ru'
													? 'Только Эксклюзив'
													: 'Exclusive Only'}
											</span>
										</div>
									)}
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
															{sortBy === 'created_at' &&
																sortOrder === 'desc' && (
																	<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
																		<span className='text-white text-xs'>
																			✓
																		</span>
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
															{sortBy === 'created_at' &&
																sortOrder === 'asc' && (
																	<div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
																		<span className='text-white text-xs'>
																			✓
																		</span>
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
								) : properties.length === 0 ? (
									<div className='flex justify-center items-center h-64 text-gray-500'>
										<p>{t('noPropertiesFound')}</p>
									</div>
								) : viewMode === 'grid' ? (
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
										{properties.map(property => (
											<PropertyCard key={property.id} property={property} />
										))}
									</div>
								) : (
									<div className='grid grid-cols-1 gap-6'>
										{properties.map(property => (
											<div
												key={property.id}
												className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'
											>
												<PropertyCard property={property} variant='default' />
											</div>
										))}
									</div>
								)}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className='mt-12 flex justify-center'>
									{/* Pagination buttons */}
								</div>
							)}
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

				.animate-fade-in {
					animation: fade-in 0.6s ease-out forwards;
					opacity: 0;
				}
			`}</style>
		</div>
	)
}
