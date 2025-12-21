// PropertyCard.tsx - Fixed arrow navigation
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
	Heart,
	MapPin,
	Bed,
	Bath,
	Maximize,
	Home,
	Play,
	// CheckCircle,
	// Clock,
	// XCircle,
	Landmark,
	Trees,
	ChevronLeft,
	ChevronRight,
	// AlertCircle,
	// Pause,
	Crown,
	Layers3,
	DoorClosed,
} from 'lucide-react'
import {
	ApartmentAttributes,
	CommercialAttributes,
	HouseAttributes,
	LandAttributes,
	Property,
	PropertyMedia,
	// PropertyStatus,
} from '@/types/property'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import {
	getTranslatedCityName,
	getTranslatedField,
	getTranslatedStateName,
} from '@/services/propertyService'
import { FaVrCardboard } from 'react-icons/fa'
import { getTranslatedStatus } from '@/utils/statusTranslations'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface PropertyCardProps {
	property: Property
	onFavoriteClick?: (propertyId: number) => void
	isFavorited?: boolean
	variant?: 'default' | 'featured' | 'compact'
}

export default function PropertyCard({
	property,
	onFavoriteClick,
	isFavorited = false,
	variant = 'default',
}: PropertyCardProps) {
	const t = useTranslations()
	const { language } = useLanguage()

	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isHovering, setIsHovering] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [currentX, setCurrentX] = useState(0)
	const [translateX, setTranslateX] = useState(0)
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
	const [thumbnailError, setThumbnailError] = useState(false)
	const sliderRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)

	// Manual navigation functions - wrapped in useCallback
	const nextImage = useCallback(() => {
		if (property.images && property.images.length > 1) {
			setCurrentImageIndex(prev => (prev + 1) % property.images!.length)
		}
	}, [property.images])

	const prevImage = useCallback(() => {
		if (property.images && property.images.length > 1) {
			setCurrentImageIndex(prev =>
				prev === 0 ? property.images!.length - 1 : prev - 1
			)
		}
	}, [property.images])

	// Touch/Mouse handlers - wrapped in useCallback
	const handleStart = useCallback(
		(clientX: number) => {
			if (!property.images || property.images.length <= 1) return
			setIsDragging(true)
			setStartX(clientX)
			setCurrentX(clientX)
		},
		[property.images]
	)

	const handleMove = useCallback(
		(clientX: number) => {
			setCurrentX(clientX)
			setTranslateX(prevTranslateX => {
				if (!isDragging || !property.images || property.images.length <= 1)
					return prevTranslateX
				return clientX - startX
			})
		},
		[isDragging, property.images, startX]
	)

	const handleEnd = useCallback(() => {
		if (!isDragging || !property.images || property.images.length <= 1) return

		setIsDragging(false)
		const deltaX = currentX - startX
		const threshold = 50

		if (Math.abs(deltaX) > threshold) {
			if (deltaX > 0) {
				prevImage()
			} else {
				nextImage()
			}
		}

		setTranslateX(0)
	}, [isDragging, property.images, currentX, startX, prevImage, nextImage])

	// Add global mouse events when dragging
	useEffect(() => {
		if (isDragging) {
			const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX)
			const handleGlobalMouseUp = () => handleEnd()

			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('mouseup', handleGlobalMouseUp)

			return () => {
				document.removeEventListener('mousemove', handleGlobalMouseMove)
				document.removeEventListener('mouseup', handleGlobalMouseUp)
			}
		}
	}, [isDragging, handleMove, handleEnd])

	// Check if property is hidden
	if (property.is_hidden) {
		return null
	}

	// Function to get full image URL
	const getImageUrl = (path?: string) => {
		if (!path) return '/api/placeholder/400/300'
		if (path.startsWith('http')) return path
		return `${API_BASE_URL}${path}`
	}

	// Get status info with icons and colors
	// const getStatusInfo = (status: PropertyStatus) => {
	// 	const statusStr =
	// 		typeof status === 'object' ? status?.name || 'active' : String(status)

	// 	const statuses = {
	// 		active: {
	// 			icon: CheckCircle,
	// 			label:
	// 				language === 'hy'
	// 					? 'Ակտիվ'
	// 					: language === 'ru'
	// 					? 'Активный'
	// 					: 'Active',
	// 			color: 'bg-green-100 text-green-800 border-green-200',
	// 		},
	// 		pending: {
	// 			icon: Clock,
	// 			label:
	// 				language === 'hy'
	// 					? 'Սպասող'
	// 					: language === 'ru'
	// 					? 'В ожидании'
	// 					: 'Pending',
	// 			color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	// 		},
	// 		sold: {
	// 			icon: XCircle,
	// 			label:
	// 				language === 'hy'
	// 					? 'Վաճառված'
	// 					: language === 'ru'
	// 					? 'Продано'
	// 					: 'Sold',
	// 			color: 'bg-red-100 text-red-800 border-red-200',
	// 		},
	// 		rented: {
	// 			icon: Pause,
	// 			label:
	// 				language === 'hy'
	// 					? 'Վարձակալված'
	// 					: language === 'ru'
	// 					? 'Арендовано'
	// 					: 'Rented',
	// 			color: 'bg-purple-100 text-purple-800 border-purple-200',
	// 		},
	// 		inactive: {
	// 			icon: AlertCircle,
	// 			label:
	// 				language === 'hy'
	// 					? 'Ոչ ակտիվ'
	// 					: language === 'ru'
	// 					? 'Неактивный'
	// 					: 'Inactive',
	// 			color: 'bg-gray-100 text-gray-800 border-gray-200',
	// 		},
	// 	}
	// 	return statuses[statusStr as keyof typeof statuses] || statuses.active
	// }

	// Mouse events
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		handleStart(e.clientX)
	}

	// Touch events
	const handleTouchStart = (e: React.TouchEvent) => {
		handleStart(e.touches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		e.preventDefault()
		handleMove(e.touches[0].clientX)
	}

	const handleTouchEnd = () => {
		handleEnd()
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

	// Enhanced video handling function
	const handleVideoLoad = () => {
		if (videoRef.current) {
			videoRef.current.currentTime = 1
		}
	}

	const renderMediaItem = (media: PropertyMedia, index: number) => {
		if (media.type === 'video') {
			return (
				<div key={media.id || index} className='relative w-full h-full'>
					{media.thumbnail_url && !thumbnailError ? (
						<>
							<Image
								src={getImageUrl(media.thumbnail_url)}
								alt={`${property.title} - Video ${index + 1}`}
								fill
								className='object-cover'
								priority={index === 0 && variant === 'featured'}
								onLoad={() => setThumbnailLoaded(true)}
								onError={() => setThumbnailError(true)}
							/>
							{!thumbnailLoaded && (
								<div className='absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center'>
									<div className='text-gray-400 text-sm'>
										Loading preview...
									</div>
								</div>
							)}
						</>
					) : (
						<>
							<video
								ref={videoRef}
								className='w-full h-full object-cover'
								preload='metadata'
								muted
								playsInline
								onLoadedData={handleVideoLoad}
								poster={`${getImageUrl(media.url)}#t=1`}
							>
								<source src={getImageUrl(media.url)} type='video/mp4' />
							</video>
						</>
					)}

					<div className='absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors'>
						<div className='bg-black/70 rounded-full p-4 backdrop-blur-sm hover:scale-110 transition-transform'>
							<Play className='w-8 h-8 text-white ml-1' />
						</div>
					</div>
				</div>
			)
		} else {
			return (
				<Image
					key={media.id || index}
					src={getImageUrl(media.url)}
					alt={`${property.title} - ${index + 1}`}
					fill
					className='object-cover'
					priority={index === 0 && variant === 'featured'}
				/>
			)
		}
	}

	// Get property type and status info
	// const statusInfo = getStatusInfo(property.status)
	// const StatusIcon = statusInfo.icon

const formatPrice = (price: number, listingType: string) => {
	const roundedPrice = Math.round(price)

	const getCurrencySymbol = (currency: string) => {
		switch (currency) {
			case 'AMD':
				return '֏'
			case 'USD':
				return '$'
			case 'RUB':
				return '₽'
			default:
				return '$'
		}
	}

	const symbol = getCurrencySymbol(property.currency || 'USD')

	let formatted: string

	if (property.currency === 'AMD') {
		formatted = `${roundedPrice.toLocaleString()} ֏`
	} else {
		formatted = new Intl.NumberFormat(
			language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'hy-AM',
			{
				style: 'currency',
				currency: property.currency || 'USD',
				maximumFractionDigits: 0,
			}
		).format(roundedPrice)
	}

	const fallbackFormatted = `${symbol}${roundedPrice.toLocaleString()}`

	switch (listingType) {
		case 'rent':
			return `${formatted || fallbackFormatted}${t.month}`
		case 'daily_rent':
			return `${formatted || fallbackFormatted}${t.day}`
		default:
			return formatted || fallbackFormatted
	}
}


	// Get listing type label
	const getListingTypeLabel = (type: string) => {
		switch (type) {
			case 'sale':
				return t.forSale
			case 'rent':
				return t.forRent
			case 'daily_rent':
				return t.forDailyRent
			default:
				return type.toUpperCase()
		}
	}

	// Get exclusive label based on language
	const getExclusiveLabel = () => {
		switch (language) {
			case 'hy':
				return 'Էքսկլյուզիվ'
			case 'ru':
				return 'Эксклюзив'
			default:
				return 'Exclusive'
		}
	}

	// Get property attributes display
	const renderPropertyAttributes = () => {
		const attributeClass = variant === 'compact' ? 'text-xs' : 'text-sm'

		switch (property.property_type) {
			case 'house':
				if ('attributes' in property && property.attributes) {
					const houseAttrs = property.attributes as HouseAttributes
					return (
						<div
							className={`flex items-center space-x-4 text-gray-600 ${attributeClass}`}
						>
							{houseAttrs.bedrooms && (
								<div className='flex items-center'>
									<Bed className='w-4 h-4 mr-1 text-blue-500' />
									<span>{houseAttrs.bedrooms}</span>
								</div>
							)}
							{houseAttrs.bathrooms && (
								<div className='flex items-center'>
									<Bath className='w-4 h-4 mr-1 text-blue-500' />
									<span>{houseAttrs.bathrooms}</span>
								</div>
							)}
							{houseAttrs.area_sqft && (
								<div className='flex items-center'>
									<Maximize className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{houseAttrs.area_sqft.toLocaleString()} {t.sqft}
									</span>
								</div>
							)}
							{houseAttrs.floors && (
								<div className='flex items-center'>
									<Layers3 className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{houseAttrs.floors} {t.floors || 'floors'}
									</span>
								</div>
							)}
						</div>
					)
				}
				break

			case 'apartment':
				if ('attributes' in property && property.attributes) {
					const aptAttrs = property.attributes as ApartmentAttributes
					return (
						<div
							className={`flex items-center space-x-4 text-gray-600 ${attributeClass}`}
						>
							{aptAttrs.bedrooms && (
								<div className='flex items-center'>
									<Bed className='w-4 h-4 mr-1 text-blue-500' />
									<span>{aptAttrs.bedrooms}</span>
								</div>
							)}
							{aptAttrs.bathrooms && (
								<div className='flex items-center'>
									<Bath className='w-4 h-4 mr-1 text-blue-500' />
									<span>{aptAttrs.bathrooms}</span>
								</div>
							)}
							{aptAttrs.area_sqft && (
								<div className='flex items-center'>
									<Maximize className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{aptAttrs.area_sqft.toLocaleString()} {t.sqft}
									</span>
								</div>
							)}
							{aptAttrs.floor && aptAttrs.total_floors && (
								<div className='flex items-center'>
									<Layers3 className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{aptAttrs.floor}/{aptAttrs.total_floors}{' '}
										{t.floor || 'floor'}
									</span>
								</div>
							)}
						</div>
					)
				}
				break

			case 'commercial':
				if ('attributes' in property && property.attributes) {
					const commercialAttrs = property.attributes as CommercialAttributes
					return (
						<div
							className={`flex items-center space-x-4 text-gray-600 ${attributeClass}`}
						>
							{commercialAttrs.area_sqft && (
								<div className='flex items-center'>
									<Maximize className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{commercialAttrs.area_sqft.toLocaleString()} {t.sqft}
									</span>
								</div>
							)}
							{commercialAttrs.floors && (
								<div className='flex items-center'>
									<Layers3 className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{commercialAttrs.floors} {t.floors || 'floors'}
									</span>
								</div>
							)}
							{commercialAttrs.rooms && (
								<div className='flex items-center'>
									<DoorClosed className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{commercialAttrs.rooms} {t.rooms || 'rooms'}
									</span>
								</div>
							)}
						</div>
					)
				}
				break

			case 'land':
				if ('attributes' in property && property.attributes) {
					const landAttrs = property.attributes as LandAttributes
					return (
						<div
							className={`flex items-center space-x-4 text-gray-600 ${attributeClass}`}
						>
							{landAttrs.area_acres && (
								<div className='flex items-center'>
									<Trees className='w-4 h-4 mr-1 text-blue-500' />
									<span>
										{landAttrs.area_acres.toLocaleString()} {t.acres}
									</span>
								</div>
							)}
						</div>
					)
				}
				break

			default:
				return null
		}
		return null
	}

	// Handle arrow button clicks - use onMouseDown to catch before Link
	const handlePrevClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopImmediatePropagation()
		if (property.images && property.images.length > 1) {
			setCurrentImageIndex(prev =>
				prev === 0 ? property.images!.length - 1 : prev - 1
			)
		}
		return false
	}

	const handleNextClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopImmediatePropagation()
		if (property.images && property.images.length > 1) {
			setCurrentImageIndex(prev => (prev + 1) % property.images!.length)
		}
		return false
	}

	// Handle indicator clicks
	const handleIndicatorClick = (e: React.MouseEvent, index: number) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopImmediatePropagation()
		setCurrentImageIndex(index)
		return false
	}

	// Handle favorite click
	const handleFavoriteClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopImmediatePropagation()
		if (onFavoriteClick) {
			onFavoriteClick(property.id)
		}
		return false
	}

	// Handle link click - prevent navigation if clicking on buttons
	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		const target = e.target as HTMLElement
		if (target.closest('button') || isDragging) {
			e.preventDefault()
			e.stopPropagation()
			return false
		}
	}

const statusValue =
	typeof property.status === 'string' ? property.status : property.status.name

const isSold = statusValue === 'sold'



	return (
		<div className='relative group'>
			<Link
				href={`/${language}/properties/${property.custom_id}`}
				target='_blank'
				onClick={handleLinkClick}
			>
				<div className=' bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 transform hover:-translate-y-2'>
					{/* Image Section with Touch/Drag Slider */}
					<div
						ref={sliderRef}
						className='relative h-64 overflow-hidden select-none'
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => setIsHovering(false)}
						onMouseDown={handleMouseDown}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
					>
						{property.images && property.images.length > 0 ? (
							<>
								<div
									className={`relative w-full h-full transition-all duration-500 group-hover:scale-110 ${
										isDragging ? '' : 'transition-transform'
									}`}
									style={{
										transform: isDragging
											? `translateX(${translateX}px)`
											: 'none',
									}}
								>
									{renderMediaItem(
										property.images[currentImageIndex],
										currentImageIndex
									)}
								</div>

								{/* Desktop Navigation Controls - FIXED */}
								{property.images.length > 1 && isHovering && !isDragging && (
									<>
										<button
											onMouseDown={handlePrevClick}
											className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-[100]'
											aria-label='Previous image'
											type='button'
										>
											<ChevronLeft className='w-5 h-5' />
										</button>
										<button
											onMouseDown={handleNextClick}
											className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-[100]'
											aria-label='Next image'
											type='button'
										>
											<ChevronRight className='w-5 h-5' />
										</button>
									</>
								)}

								{/* Image Indicators */}
								{property.images.length > 1 && (
									<div className='absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-[90]'>
										{property.images.map((_, index) => (
											<button
												key={index}
												onMouseDown={e => handleIndicatorClick(e, index)}
												className={`w-2 h-2 rounded-full transition-all duration-300 ${
													index === currentImageIndex
														? 'bg-white scale-125'
														: 'bg-white/50 hover:bg-white/80'
												}`}
												aria-label={`Go to image ${index + 1}`}
												type='button'
											/>
										))}
									</div>
								)}

								{/* Media Count Badge */}
								{property.images.length > 1 && (
									<div className='absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm z-20'>
										{currentImageIndex + 1}/{property.images.length}
									</div>
								)}

								{/* 3D Button — под Media Count Badge */}
								{property.url_3d && property.url_3d.trim() !== '' && (
									<button
										type='button'
										onClick={e => {
											e.stopPropagation()
											window.open(
												property.url_3d,
												'_blank',
												'noopener,noreferrer'
											)
										}}
										className='
    absolute top-[2.5rem] right-3
    z-30
    bg-white/95 hover:bg-white
    text-gray-800
    px-2 py-1
    rounded-full
    shadow-lg
    flex items-center gap-1 text-xs font-medium
    backdrop-blur-sm
    transition-all duration-200
  '
									>
										<FaVrCardboard className='w-3 h-3' />
										<span>3D</span>
									</button>
								)}

								{/* Drag Indicator for Mobile */}
								{property.images.length > 1 && (
									<div className='absolute bottom-10 left-1/2 transform -translate-x-1/2 md:hidden z-10'>
										<div className='bg-black/50 text-white px-2 py-1 rounded text-xs'>
											← Swipe →
										</div>
									</div>
								)}
							</>
						) : (
							<div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
								<div className='text-center'>
									<Home className='w-12 h-12 text-gray-400 mx-auto mb-2' />
									<span className='text-gray-500 text-sm'>{t.noImage}</span>
								</div>
							</div>
						)}

						{/* Enhanced Badges */}
						{!isSold && (
							<div className='absolute top-3 left-3 flex flex-col gap-2 z-10'>
								{/* Exclusive Badge */}
								{property.is_exclusive && (
									<span className='px-3 py-1 rounded-full text-xs font-bold text-white bg-red-600 shadow-lg flex items-center gap-1 animate-pulse'>
										<Crown className='w-3 h-3' />
										{getExclusiveLabel()}
									</span>
								)}

								{/* Listing Type Badge */}
								<span
									className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
										property.listing_type === 'sale'
											? 'bg-gradient-to-r from-green-500 to-emerald-600'
											: property.listing_type === 'rent'
											? 'bg-gradient-to-r from-blue-500 to-blue-600'
											: 'bg-gradient-to-r from-purple-500 to-purple-600'
									}`}
								>
									{getListingTypeLabel(property.listing_type)}
								</span>

								{/* Status Badge */}
								{/*<span
							className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${statusInfo.color}`}
						>
							<StatusIcon className='w-3 h-3' />
							{statusInfo.label}
						</span>*/}
							</div>
						)}

						{/* Action Buttons */}
						<div className='absolute top-3 right-3 z-10'>
							{onFavoriteClick && (
								<button
									onClick={handleFavoriteClick}
									className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 ${
										isFavorited
											? 'bg-red-500 text-white'
											: 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
									}`}
									aria-label='Add to favorites'
									type='button'
								>
									formatPrice
									<Heart
										className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`}
									/>
								</button>
							)}
						</div>
						{isSold && (
							<>
								{/* Beautiful SOLD label */}
								<div className='absolute inset-0 z-30 flex items-center justify-center pointer-events-none'>
									<div className='relative'>
										{/* Glow effect behind */}
										<div className='absolute inset-0 bg-red-500/30 blur-xl scale-110 rounded-lg' />

										{/* Main SOLD badge */}
										<div
											className='
            relative
            bg-gradient-to-br from-red-600 via-red-700 to-red-800
            text-white font-black
            px-20 py-5 text-3xl tracking-[0.3em]
            transform -rotate-12
            shadow-[0_20px_60px_rgba(220,38,38,0.5)]
            border-4 border-white/90
            rounded-sm
            uppercase
            animate-pulse
            before:content-[""]
            before:absolute
            before:inset-0
            before:bg-gradient-to-t
            before:from-black/20
            before:to-transparent
            before:rounded-sm
          '
										>
											{/* Inner shine effect */}
											<div className='absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-sm' />

											<span className='relative drop-shadow-lg'>
												{' '}
												{getTranslatedStatus('sold', language).label}
											</span>

											{/* Corner decorations */}
											<div className='absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-white/70' />
											<div className='absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-white/70' />
											<div className='absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-white/70' />
											<div className='absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-white/70' />
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					{/* Content Section */}
					<div className='p-4'>
						{/* Title with Exclusive indicator */}
						<div className='flex items-center justify-between mb-3'>
							<h3 className='font-bold text-[16px] text-gray-900 text-lg group-hover:text-blue-600 transition-colors flex-1'>
								{property.title.length > 24
									? property.title.slice(0, 22) + '...'
									: property.title}
							</h3>
						</div>

						{/* Location */}
						<div className='flex items-center text-gray-600 mb-4'>
							<MapPin className='w-4 h-4 mr-2 text-blue-500 flex-shrink-0' />
							<div className='text-sm truncate'>
								{(() => {
									if (property.state) {
										if (property.district) {
											const districtName = getTranslatedDistrictName(
												property.district,
												language
											)
											const stateName = getTranslatedStateName(
												property.state.name,
												language
											)
											return `${districtName}, ${stateName}`
										} else if (property.city) {
											const cityName = getTranslatedCityName(
												property.city.name,
												language
											)
											const stateName = getTranslatedStateName(
												property.state.name,
												language
											)
											return `${cityName}, ${stateName}`
										} else {
											return getTranslatedStateName(
												property.state.name,
												language
											)
										}
									}
									return ''
								})()}
							</div>
						</div>

						{/* Price */}
						<div className='text-[16px] font-bold text-blue-600 mb-4'>
							{formatPrice(property.price, property.listing_type)}
						</div>

						{/* Property Attributes */}
						<div className='mb-4'>{renderPropertyAttributes()}</div>

						{/* Property ID and Stats */}
						<div className='flex justify-between items-center pt-4 border-t border-gray-100'>
							<span className='text-sm text-gray-900 font-bold'>
								ID: {property.custom_id}
							</span>
							<div className='flex items-center space-x-4 text-xs text-gray-500'>
								<span>👁 {property.views}</span>
								<span>
									📅 {new Date(property.created_at).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</div>
	)
}
