// PropertiesContent.tsx - Updated to filter hidden properties
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
	Search,
	MapPin,
	Home,
	RefreshCw,
	ChevronDown,
	X,
	Eye,
	Calendar,
	Crown, // Add Crown for exclusive filter
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/translations/translations'
import Image from 'next/image'

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
	const [showExclusiveOnly, setShowExclusiveOnly] = useState(false) // Add exclusive filter

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

		// ✅ FIXED: Parse property attribute parameters
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


		// Basic filters
		if (property_type)
			initialFilter.property_type = property_type as PropertyType
		if (listing_type) initialFilter.listing_type = listing_type as ListingType
		if (state_id) initialFilter.state_id = parseInt(state_id)
		if (city_id) initialFilter.city_id = parseInt(city_id)
		if (district_id) initialFilter.district_id = parseInt(district_id)
		if (min_price) initialFilter.min_price = parseFloat(min_price)
		if (max_price) initialFilter.max_price = parseFloat(max_price)
		if (exclusive === 'true') setShowExclusiveOnly(true)

		// ✅ FIXED: Apply ALL property attributes
		if (bedrooms) initialFilter.bedrooms = parseInt(bedrooms)
		if (bathrooms) initialFilter.bathrooms = parseFloat(bathrooms)

		if (floors) initialFilter.floors = parseInt(floors)
		if (floor) initialFilter.floor = parseInt(floor)
		if (total_floors) initialFilter.total_floors = parseInt(total_floors)
		if (ceiling_height)
			initialFilter.ceiling_height = parseFloat(ceiling_height)
		if (min_lot_size_sqft) initialFilter.min_lot_size_sqft = parseInt(min_lot_size_sqft)
		if (max_lot_size_sqft) initialFilter.max_lot_size_sqft = parseInt(max_lot_size_sqft)
		if (business_type) initialFilter.business_type = business_type
		if (min_area_sqft) initialFilter.min_area_sqft = parseInt(min_area_sqft)
		if (max_area_sqft) initialFilter.max_area_sqft = parseInt(max_area_sqft)
		if (min_area_acres) initialFilter.min_area_acres = parseFloat(min_area_acres)
		if (max_area_acres) initialFilter.max_area_acres = parseFloat(max_area_acres)
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
			console.log('Fetching properties with filter:', {
				...filter,
				page: currentPage,
				sort_by: sortBy,
				sort_order: sortOrder,
				is_exclusive: showExclusiveOnly ? true : undefined, // Add exclusive filter
				show_hidden: false, // Explicitly hide hidden properties
			})

				const data = await getProperties({
					...filter, // This now includes ALL parameters
					page: currentPage,
					sort_by: sortBy,
					sort_order: sortOrder,
					limit: 50,
					is_exclusive: showExclusiveOnly ? true : undefined,
					show_hidden: false,
				})

			console.log('Received properties data:', data)

			if (data && Array.isArray(data) && data.length > 0) {
				// Additional client-side filtering to ensure no hidden properties slip through
				const visibleProperties = data.filter(property => !property.is_hidden)

				// Apply exclusive filter if needed
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
				console.log('No properties returned from API')
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

	const handleFilterChange = (newFilter: FilterType) => {
		setFilter(newFilter)
		setCurrentPage(1)
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleSortChange = (
		newSortBy: 'price' | 'created_at' | 'views',
		newSortOrder: 'asc' | 'desc'
	) => {
		setSortBy(newSortBy)
		setSortOrder(newSortOrder)
		setCurrentPage(1)
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

	const formatPrice = (price: number, listingType: string) => {
		const formatted = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(price)

		switch (listingType) {
			case 'rent':
				return `${formatted}/month`
			case 'daily_rent':
				return `${formatted}/day`
			default:
				return formatted
		}
	}

	const formatLocalizedDate = (
		date: string | Date,
		language: 'hy' | 'en' | 'ru'
	) => {
		const dateObj = new Date(date)

		const monthNames = {
			hy: [
				'Հունվար',
				'Փետրվար',
				'Մարտ',
				'Ապրիլ',
				'Մայիս',
				'Հունիս',
				'Հուլիս',
				'Օգոստոս',
				'Սեպտեմբեր',
				'Հոկտեմբեր',
				'Նոյեմբեր',
				'Դեկտեմբեր',
			],
			en: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			],
			ru: [
				'Январь',
				'Февраль',
				'Март',
				'Апрель',
				'Май',
				'Июнь',
				'Июль',
				'Август',
				'Сентябрь',
				'Октябрь',
				'Ноябрь',
				'Декабрь',
			],
		}

		const day = dateObj.getDate()
		const month = monthNames[language][dateObj.getMonth()]
		const year = dateObj.getFullYear()

		return `${day} ${month} ${year}`
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50'>
			{/* Header Section */}
			<div className='bg-white shadow-lg border-b border-gray-100'>
				<div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
						<div className='mb-6 lg:mb-0'>
							<div className='flex items-center mb-2'>
								<div className='p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-4 shadow-lg'>
									<Home className='w-8 h-8 text-white' />
								</div>
								<h1 className='text-4xl font-bold text-gray-900'>
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
						{/* Left Controls - Add Exclusive Filter */}
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
					{/* Filters Section - Now at Top */}
					<div className='mb-8'>
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
						<div
							className={`${
								showFilters ? 'block' : 'hidden lg:block'
							} transition-all duration-300 ease-in-out`}
						>
							<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
								{/* Updated PropertyFilter with 3 filters per line */}
								<PropertyFilter
									onFilterChange={handleFilterChange}
									initialFilter={filter}
								/>
							</div>
						</div>
					</div>

					{/* Properties Grid - Now Full Width */}
					<div className='w-full'>
						{loading ? (
							<div className='flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-lg border border-gray-100'>
								<div className='relative'>
									<Loader2 className='w-16 h-16 animate-spin text-blue-600' />
									<div className='absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse'></div>
								</div>
								<p className='mt-4 text-gray-600 font-medium'>
									{t('loadingProperties')}...
								</p>
								<p className='mt-2 text-gray-400 text-sm'>
									{t('pleaseWaitWhileFetching')}
								</p>
							</div>
						) : error ? (
							<div className='text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100'>
								<div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
									<X className='w-10 h-10 text-red-600' />
								</div>
								<h3 className='text-xl font-semibold text-gray-900 mb-2'>
									{t('oopsSomethingWentWrong')}
								</h3>
								<p className='text-red-600 mb-4'>{error}</p>
								<button
									onClick={fetchProperties}
									className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'
								>
									<RefreshCw className='w-4 h-4 mr-2' />
									{t('tryAgain')}
								</button>
							</div>
						) : properties.length === 0 ? (
							<div className='text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100'>
								<div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
									<Search className='w-10 h-10 text-gray-400' />
								</div>
								<h3 className='text-xl font-semibold text-gray-900 mb-2'>
									{t('noPropertiesFound')}
								</h3>
								{showExclusiveOnly && (
									<p className='text-gray-600 mb-4'>
										{language === 'hy'
											? 'Էքսկլյուզիվ հայտարարություններ չեն գտնվել'
											: language === 'ru'
											? 'Эксклюзивные объявления не найдены'
											: 'No exclusive properties found'}
									</p>
								)}
							</div>
						) : (
							<>
								{/* Results Summary */}
								<div className='mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 gap-4'>
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

									{/* Controls */}
									<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto'>
										{/* Sort Dropdown */}
										<div className='relative group w-full sm:w-auto'>
											<button className='flex items-center justify-between px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 w-full sm:w-auto min-w-[160px]'>
												<span className='text-sm font-medium mr-2'>
													{t('sortBy')}:{' '}
													{sortBy === 'created_at'
														? t('date')
														: sortBy === 'price'
														? t('price')
														: t('views')}
												</span>
												<ChevronDown className='w-4 h-4' />
											</button>

											<div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20'>
												<div className='p-2'>
													{[
														{
															key: 'created_at',
															label: t('dateAdded'),
															orders: [
																{ key: 'desc', label: t('newestFirst') },
																{ key: 'asc', label: t('oldestFirst') },
															],
														},
														{
															key: 'price',
															label: t('price'),
															orders: [
																{ key: 'asc', label: t('lowToHigh') },
																{ key: 'desc', label: t('highToLow') },
															],
														},
														{
															key: 'views',
															label: t('popularity'),
															orders: [
																{ key: 'desc', label: t('mostViewed') },
																{ key: 'asc', label: t('leastViewed') },
															],
														},
													].map(sort => (
														<div key={sort.key}>
															<div className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase'>
																{sort.label}
															</div>
															{sort.orders.map(order => (
																<button
																	key={`${sort.key}-${order.key}`}
																	onClick={() =>
																		handleSortChange(
																			sort.key as
																				| 'created_at'
																				| 'price'
																				| 'views',
																			order.key as 'asc' | 'desc'
																		)
																	}
																	className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
																		sortBy === sort.key &&
																		sortOrder === order.key
																			? 'bg-blue-50 text-blue-700'
																			: 'text-gray-700 hover:bg-gray-50'
																	}`}
																>
																	{order.label}
																</button>
															))}
														</div>
													))}
												</div>
											</div>
										</div>

										{/* View Mode Toggle */}
										<div className='flex items-center bg-gray-100 p-1 rounded-xl'>
											<button
												onClick={() => setViewMode('grid')}
												className={`p-2 rounded-lg transition-colors ${
													viewMode === 'grid'
														? 'bg-white text-blue-600 shadow-sm'
														: 'text-gray-600 hover:text-gray-900'
												}`}
											>
												<Grid3X3 className='w-4 h-4' />
											</button>
											<button
												onClick={() => setViewMode('list')}
												className={`p-2 rounded-lg transition-colors ${
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

								{/* Properties Display - Full Width Grid */}
								{viewMode === 'grid' ? (
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
										{properties.map((property, index) => (
											<div
												key={property.id}
												className='animate-fade-in'
												style={{ animationDelay: `${index * 100}ms` }}
											>
												<PropertyCard property={property} />
											</div>
										))}
									</div>
								) : (
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
										{properties.map((property, index) => (
											<div
												key={property.id}
												className='animate-fade-in bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'
												style={{ animationDelay: `${index * 50}ms` }}
											>
												<Link
													href={`/${language}/properties/${property.custom_id}`}
												>
													<div className='flex flex-col md:flex-row'>
														<div className='md:w-1/3 h-48 md:h-auto relative'>
															{property.images && property.images.length > 0 ? (
																<Image
																	src={property.images[0].url}
																	alt={property.title}
																	className='w-full h-full object-cover'
																	width={500}
																	height={300}
																/>
															) : (
																<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
																	<Home className='w-12 h-12 text-gray-400' />
																</div>
															)}
															{/* Exclusive badge in list view */}
															{property.is_exclusive && (
																<div className='absolute top-2 left-2'>
																	<span className='px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1'>
																		<Crown className='w-3 h-3' />
																		{language === 'hy'
																			? 'Էքսկլյուզիվ'
																			: language === 'ru'
																			? 'Эксклюзив'
																			: 'Exclusive'}
																	</span>
																</div>
															)}
														</div>
														<div className='md:w-2/3 p-6'>
															<div className='flex justify-between items-start mb-2'>
																<h3 className='text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2'>
																	{property.title}
																	{property.is_exclusive && (
																		<Crown className='w-4 h-4 text-red-600' />
																	)}
																</h3>
																<span className='text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600'>
																	ID: {property.custom_id}
																</span>
															</div>
															<div className='flex items-center text-gray-600 mb-3'>
																<MapPin className='w-4 h-4 mr-2 text-blue-500' />
																<span>
																	{property.city?.name}, {property.state?.name}
																</span>
															</div>
															<div className='text-2xl font-bold text-blue-600 mb-4'>
																{formatPrice(
																	property.price,
																	property.listing_type
																)}
															</div>
															<div className='flex items-center justify-between'>
																<div className='flex items-center space-x-4 text-gray-600 text-sm'>
																	{/* Property attributes rendering here */}
																</div>
																<div className='flex items-center space-x-4 text-xs text-gray-500'>
																	<div className='flex items-center'>
																		<Eye className='w-3 h-3 mr-1' />
																		{property.views}
																	</div>
																	<div className='flex items-center'>
																		<Calendar className='w-3 h-3 mr-1' />
																		{formatLocalizedDate(
																			property.created_at,
																			language
																		)}
																	</div>
																</div>
															</div>
														</div>
													</div>
												</Link>
											</div>
										))}
									</div>
								)}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className='mt-12 flex justify-center'>
										<nav className='flex items-center space-x-2'>
											<button
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={currentPage === 1}
												className='px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											>
												{t('previous')}
											</button>

											{[...Array(Math.min(totalPages, 7))].map((_, index) => {
												let pageNumber
												if (totalPages <= 7) {
													pageNumber = index + 1
												} else {
													if (currentPage <= 4) {
														pageNumber = index + 1
													} else if (currentPage >= totalPages - 3) {
														pageNumber = totalPages - 6 + index
													} else {
														pageNumber = currentPage - 3 + index
													}
												}

												return (
													<button
														key={pageNumber}
														onClick={() => handlePageChange(pageNumber)}
														className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
															currentPage === pageNumber
																? 'bg-blue-600 text-white shadow-lg'
																: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
														}`}
													>
														{pageNumber}
													</button>
												)
											})}

											<button
												onClick={() => handlePageChange(currentPage + 1)}
												disabled={currentPage === totalPages}
												className='px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											>
												{t('next')}
											</button>
										</nav>
									</div>
								)}
							</>
						)}
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
