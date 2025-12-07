'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getTranslatedFeature } from '@/utils/featureTranslations'
import { getTranslatedStatus } from '@/utils/statusTranslations'
import { Property, PropertyStatus } from '@/types/property'
import {
	getPropertyByCustomId,
	getTranslatedCityName,
	getTranslatedField,
	getTranslatedStateName,
} from '@/services/propertyService'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import {
	MapPin,
	Bed,
	Bath,
	Maximize,
	Calendar,
	Home,
	Building2,
	Landmark,
	Trees,
	Check,
	X,
	Share2,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Tag,
	Eye,
	Info,
	Copy,
	FileText,
	Play,
	RefreshCw,
	TrendingUp,
	MapIcon,
	Maximize2,
	Layers3,
	CheckCircle,
	AlertCircle,
	Clock,
	XCircle,
	Phone,
	Boxes,
	Glasses,
} from 'lucide-react'

import { RxHeight } from 'react-icons/rx'

import Link from 'next/link'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import React from 'react'
import ymaps from 'yandex-maps'
import ContactPopup from '@/app/_components/ContactPopup'
import { FaVrCardboard } from 'react-icons/fa'

interface PropertyDetailClientProps {
	property: Property
}

const YandexMap = ({
	latitude,
	longitude,
	address,
	title,
	isPopup = false,
}: {
	latitude: number
	longitude: number
	address: string
	title: string
	isPopup?: boolean
	onClose?: () => void
}) => {
	const [mapLoaded, setMapLoaded] = useState(false)
	const [mapError, setMapError] = useState(false)
	const mapRef = useRef<ymaps.Map | null>(null)

	const mapId = isPopup ? 'yandex-map-popup' : 'yandex-map'
	const mapHeight = isPopup ? 'h-[500px]' : 'h-64'

	const lat = Number(latitude)
	const lng = Number(longitude)

	// Validate coordinates
	const isValid =
		!isNaN(lat) &&
		!isNaN(lng) &&
		lat !== 0 &&
		lng !== 0 &&
		Math.abs(lat) <= 90 &&
		Math.abs(lng) <= 180

	useEffect(() => {
		if (!isValid || mapRef.current) return

		const initMap = async () => {
			try {
				// Wait for container to exist
				const container = document.getElementById(mapId)
				if (!container) return

				// Wait for ymaps to be ready
				await window.ymaps.ready()

				const zoom = isPopup ? 17 : 16

				// Create map
				const map = new window.ymaps.Map(mapId, {
					center: [lat, lng],
					zoom: zoom,
					controls: ['zoomControl', 'typeSelector'],
				})

				// Add marker
				const placemark = new window.ymaps.Placemark(
					[lat, lng],
					{
						balloonContent: `<b>${title}</b><br/>${address}`,
						hintContent: title,
					},
					{
						preset: 'islands#redIcon',
					}
				)

				map.geoObjects.add(placemark)

				if (isPopup) {
					placemark.balloon.open()
				}

				mapRef.current = map as unknown as ymaps.Map
				setMapLoaded(true)
			} catch (error) {
				console.error('Map init error:', error)
				setMapError(true)
			}
		}

		// Load Yandex Maps script
		if (!window.ymaps) {
			const existingScript = document.querySelector(
				'script[src*="api-maps.yandex.ru"]'
			)

			if (!existingScript) {
				const script = document.createElement('script')
				script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=en_US`
				script.onload = () => initMap()
				script.onerror = () => setMapError(true)
				document.head.appendChild(script)
			} else {
				existingScript.addEventListener('load', () => initMap())
			}
		} else {
			initMap()
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.destroy()
				mapRef.current = null
			}
		}
	}, [lat, lng, isValid, mapId, title, address, isPopup])

	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return

		const resizeMap = () => {
			if (mapRef.current) {
				try {
					mapRef.current.container.fitToViewport()
					const center = mapRef.current.getCenter()
					const zoom = mapRef.current.getZoom()
					mapRef.current.setCenter(center, zoom)
				} catch (e) {
					console.warn('Map resize failed', e)
				}
			}
		}
		const timeouts = [
			setTimeout(resizeMap, 100),
			setTimeout(resizeMap, 300),
			setTimeout(resizeMap, 600),
		]

		// Наблюдаем за видимостью контейнера
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) resizeMap()
				})
			},
			{ threshold: 0.1 }
		)

		const container = document.getElementById(mapId)
		if (container) observer.observe(container)

		window.addEventListener('resize', resizeMap)

		return () => {
			timeouts.forEach(clearTimeout)
			observer.disconnect()
			window.removeEventListener('resize', resizeMap)
		}
	}, [mapLoaded, mapId])


	if (!isValid || mapError) {
		return (
			<div
				className={`w-full ${mapHeight} bg-gray-100 rounded-xl flex items-center justify-center`}
			>
				<div className='text-center p-6'>
					<MapIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
					<p className='text-gray-500 text-sm mb-3'>
						{!isValid ? 'Invalid coordinates' : 'Map unavailable'}
					</p>
					<div className='flex gap-2 justify-center'>
						<a
							href={`https://yandex.com/maps/?pt=${lng},${lat}&z=16`}
							target='_blank'
							rel='noopener noreferrer'
							className='px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700'
						>
							Yandex Maps
						</a>
						<a
							href={`https://maps.google.com/?q=${lat},${lng}`}
							target='_blank'
							rel='noopener noreferrer'
							className='px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700'
						>
							Google Maps
						</a>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div
			className='relative w-full'
			style={{ minHeight: isPopup ? '500px' : '256px' }}
		>
			<div
				id={mapId}
				className={`w-full ${mapHeight} rounded-xl overflow-hidden bg-gray-200`}
				style={{ width: '100%', height: isPopup ? '500px' : '256px' }}
			/>
			{!mapLoaded && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl'>
					<div className='text-center'>
						<Loader2 className='w-8 h-8 text-blue-600 animate-spin mx-auto mb-2' />
						<p className='text-gray-500 text-sm'>Loading map...</p>
					</div>
				</div>
			)}
		</div>
	)
}


const API_BASE_URL = 'https://chance-realty-admin.vercel.app'

// Updated CurrencyDisplay component for PropertyDetailClient.tsx

function CurrencyDisplay({
	amount,
	originalCurrency,
	listingType,
	language = 'hy',
}: {
	amount: number
	originalCurrency: string
	listingType: string
	language?: string
}) {
	// ✅ FIX: Determine target currencies based on original currency
	const getTargetCurrencies = (baseCurrency: string): string[] => {
		switch (baseCurrency) {
			case 'USD':
				return ['AMD', 'RUB'] // USD -> AMD, RUB
			case 'AMD':
				return ['USD', 'RUB'] // AMD -> USD, RUB
			case 'RUB':
				return ['USD', 'AMD'] // RUB -> USD, AMD
			default:
				return ['AMD', 'RUB'] // Default fallback
		}
	}

	const targetCurrencies = getTargetCurrencies(originalCurrency)

	const conversionOptions = useMemo(
		() => ({
			autoFetch: true,
			refreshInterval: 30 * 60 * 1000,
			targetCurrencies, // ✅ Use dynamic target currencies
		}),
		[targetCurrencies]
	)

	const getRentalPeriodSuffix = useCallback(
		(listingType: string, language: string) => {
			switch (listingType) {
				case 'rent':
					return language === 'hy'
						? '/ամիս'
						: language === 'ru'
						? '/месяц'
						: '/month'
				case 'daily_rent':
					return language === 'hy'
						? '/օր'
						: language === 'ru'
						? '/день'
						: '/day'
				default:
					return ''
			}
		},
		[]
	)

	const { original, conversions, loading, error, refresh, isStale } =
		useCurrencyConversion(amount, originalCurrency, conversionOptions)

	const formatPriceWithSuffix = useCallback(
		(formattedAmount: string) => {
			const suffix = getRentalPeriodSuffix(listingType, language)
			return suffix ? `${formattedAmount}${suffix}` : formattedAmount
		},
		[listingType, language, getRentalPeriodSuffix]
	)

	const getCurrencyFlag = useCallback((currency: string) => {
		const flags: Record<string, string> = {
			USD: '🇺🇸',
			RUB: '🇷🇺',
			AMD: '🇦🇲',
		}
		return flags[currency] || '💰'
	}, [])

	if (loading && !original.formattedAmount) {
		return (
			<div className='flex items-center space-x-2'>
				<Loader2 className='w-5 h-5 animate-spin text-blue-600' />
				<span className='text-gray-500'>Loading exchange rates...</span>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='text-3xl font-bold text-blue-600 flex items-center'>
					{formatPriceWithSuffix(original.formattedAmount)}
				</div>
				<button
					onClick={refresh}
					disabled={loading}
					className={`p-2 rounded-full transition-colors ${
						isStale
							? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
							: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
					}`}
					title={
						isStale
							? 'Exchange rates may be outdated - click to refresh'
							: 'Refresh exchange rates'
					}
				>
					<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
				</button>
			</div>

			{conversions.length > 0 && (
				<div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100'>
					<div className='flex items-center justify-between mb-3'>
						{error && (
							<span className='text-xs text-red-500 flex items-center'>
								<X className='w-3 h-3 mr-1' />
								Failed to load rates
							</span>
						)}
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						{conversions.map(conversion => (
							<div
								key={conversion.currency}
								className='bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors'
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<span className='text-lg mr-2'>
											{getCurrencyFlag(conversion.currency)}
										</span>
										<div>
											<div className='font-semibold text-gray-900'>
												{formatPriceWithSuffix(conversion.formattedAmount)}
											</div>
											{conversion.rate && (
												<div className='text-xs text-gray-500'>
													1 {original.currency} = {conversion.rate.toFixed(2)}{' '}
													{conversion.currency}
												</div>
											)}
										</div>
									</div>
									{listingType === 'sale' && (
										<TrendingUp className='w-4 h-4 text-green-500' />
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default function PropertyDetailClient({}: PropertyDetailClientProps) {
	const t = useTranslations()
	const { language } = useLanguage()
	const params = useParams()
	const [property, setProperty] = useState<Property | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedImage, setSelectedImage] = useState(0)
	const [showFullGallery, setShowFullGallery] = useState(false)
	const [showMapPopup, setShowMapPopup] = useState(false)
	const [showShareOptions, setShowShareOptions] = useState(false)
	const [showContactPopup, setShowContactPopup] = useState(false)
	const [galleryIndex, setGalleryIndex] = useState(0)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)
	const getImageUrl = useCallback((path: string) => {
		if (path?.startsWith('http')) return path
		return `${API_BASE_URL}${path}`
	}, [])

	useEffect(() => {
		const fetchProperty = async () => {
			if (!params.id) return

			try {
				setLoading(true)
				const data = await getPropertyByCustomId(params.id as string)
				setProperty(data)
			} catch (err) {
				setError('Failed to load property details')
				console.error('Error fetching property:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchProperty()
	}, [params.id])

	const nextImage = useCallback(() => {
		if (!property?.images) return
		setSelectedImage(prev => (prev + 1) % (property.images?.length ?? 1))
	}, [property?.images])

	const prevImage = useCallback(() => {
		if (!property?.images) return
		setSelectedImage(
			prev =>
				(prev - 1 + (property.images?.length ?? 0)) %
				(property.images?.length ?? 1)
		)
	}, [property?.images])


	const copyLinkToClipboard = useCallback(() => {
		navigator.clipboard.writeText(window.location.href)
		setShowShareOptions(false)
	}, [language])


	// Enhanced translation functions
	const getPropertyTypeLabel = (type: string) => {
		switch (type) {
			case 'house':
				return language === 'hy' ? 'Տուն' : language === 'ru' ? 'Дом' : 'House'
			case 'apartment':
				return language === 'hy'
					? 'Բնակարան'
					: language === 'ru'
					? 'Квартира'
					: 'Apartment'
			case 'commercial':
				return language === 'hy'
					? 'Կոմերցիոն'
					: language === 'ru'
					? 'Коммерческая'
					: 'Commercial'
			case 'land':
				return language === 'hy'
					? 'Հողատարածք'
					: language === 'ru'
					? 'Земельный участок'
					: 'Land'
			default:
				return type
		}
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

	const handleShare = async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: document.title,
					text: 'Check this out!',
					url: window.location.href,
				})
			} else {
				await navigator.clipboard.writeText(window.location.href)
				alert('Link copied to clipboard!')
			}
		} catch (error) {
			console.error('Error sharing:', error)
		}
	}

	const getTranslatedContent = (
		property: Property,
		field: 'title' | 'description',
		language: 'hy' | 'en' | 'ru'
	) => {
		// Check for translated fields based on language
		if (language === 'en' && property[`${field}_en` as keyof Property]) {
			return property[`${field}_en` as keyof Property] as string
		}

		if (language === 'ru' && property[`${field}_ru` as keyof Property]) {
			return property[`${field}_ru` as keyof Property] as string
		}

		// Fall back to original field (Armenian)
		return property[field] || ''
	}

	const getListingTypeLabel = (type: string) => {
		switch (type) {
			case 'sale':
				return language === 'hy'
					? 'Վաճառք'
					: language === 'ru'
					? 'Продажа'
					: 'For Sale'
			case 'rent':
				return language === 'hy'
					? 'Վարձակալություն'
					: language === 'ru'
					? 'Аренда'
					: 'For Rent'
			case 'daily_rent':
				return language === 'hy'
					? 'Օրավարձ'
					: language === 'ru'
					? 'Посуточная аренда'
					: 'Daily Rent'
			default:
				return type.toUpperCase()
		}
	}


	const getStatusIcon = (status: string | PropertyStatus) => {
		const statusStr =
			typeof status === 'object' ? status?.name || 'active' : String(status)

		switch (statusStr.toLowerCase()) {
			case 'active':
				return CheckCircle
			case 'pending':
				return Clock
			case 'sold':
			case 'rented':
				return XCircle
			case 'inactive':
				return AlertCircle
			default:
				return CheckCircle
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
				hy: 'Մակերես',
				ru: 'Площадь',
				en: 'Area',
			},
		}
		return labels[key]?.[language] || key
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.targetTouches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return

		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > 50
		const isRightSwipe = distance < -50

		if (isLeftSwipe && galleryIndex < property.images!.length - 1) {
			setGalleryIndex(prev => prev + 1)
		}
		if (isRightSwipe && galleryIndex > 0) {
			setGalleryIndex(prev => prev - 1)
		}

		setTouchStart(0)
		setTouchEnd(0)
	}

	const nextGalleryImage = () => {
		setGalleryIndex(prev =>
			prev < property.images!.length - 1 ? prev + 1 : prev
		)
	}

	const prevGalleryImage = () => {
		setGalleryIndex(prev => (prev > 0 ? prev - 1 : 0))
	}


	// Click handler for images to open gallery
	const handleImageClick = useCallback(() => {
		setShowFullGallery(true)
	}, [])

	const getPropertyAttributes = useCallback(() => {
		if (!property) return null

		switch (property.property_type) {
			case 'house':
				return (
					<div className='grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6'>
						{'attributes' in property && property.attributes && (
							<>
								{property.attributes.bedrooms != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Bed className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('bedrooms')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.bedrooms}
											</p>
										</div>
									</div>
								)}

								{property.attributes.bathrooms != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Bath className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('bathrooms')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.bathrooms}
											</p>
										</div>
									</div>
								)}

								{property.attributes.area_sqft != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Maximize className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('area_sqft')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.area_sqft.toLocaleString()} {t.sqft}
											</p>
										</div>
									</div>
								)}

								{property.attributes.lot_size_sqft != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<MapPin className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('lot_size_sqft')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.lot_size_sqft.toLocaleString()} {t.sqft}
											</p>
										</div>
									</div>
								)}

								{property.attributes.floors != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Layers3 className='w-5 h-5 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('floors')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.floors}
											</p>
										</div>
									</div>
								)}

								{property.attributes.ceiling_height != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<RxHeight className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('ceiling_height')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.ceiling_height} մ
											</p>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				)

			case 'apartment':
				return (
					<div className='grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6'>
						{'attributes' in property && property.attributes && (
							<>
								{property.attributes.bedrooms != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Bed className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('bedrooms')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.bedrooms}
											</p>
										</div>
									</div>
								)}

								{property.attributes.bathrooms != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Bath className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('bathrooms')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.bathrooms}
											</p>
										</div>
									</div>
								)}

								{property.attributes.area_sqft != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Maximize className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('area_sqft')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.area_sqft.toLocaleString()}{' '}
												{t.sqft}
											</p>
										</div>
									</div>
								)}

								{property.attributes.floor != null &&
									property.attributes.total_floors != null && (
										<div className='flex items-center'>
											<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
												<Layers3 className='w-5 h-5 text-blue-600' />
											</div>
											<div>
												<p className='text-xs text-gray-500'>
													{getAttributeLabel('floor')}
												</p>
												<p className='font-medium text-gray-700'>
													{property.attributes.floor} /{' '}
													{property.attributes.total_floors}
												</p>
											</div>
										</div>
									)}

								{property.attributes.ceiling_height != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<RxHeight className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('ceiling_height')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.ceiling_height} մ
											</p>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				)

			case 'commercial':
				return (
					<div className='grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6'>
						{'attributes' in property && property.attributes && (
							<>
								{property.attributes.area_sqft != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Maximize className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('area_sqft')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.area_sqft.toLocaleString()}{' '}
												{t.sqft}
											</p>
										</div>
									</div>
								)}

								{property.attributes.business_type && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Landmark className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('business_type')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.business_type}
											</p>
										</div>
									</div>
								)}

								{property.attributes.floors != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<Layers3 className='w-5 h-5 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('floors')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.floors}
											</p>
										</div>
									</div>
								)}

								{property.attributes.ceiling_height != null && (
									<div className='flex items-center'>
										<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
											<RxHeight className='w-6 h-6 text-blue-600' />
										</div>
										<div>
											<p className='text-xs text-gray-500'>
												{getAttributeLabel('ceiling_height')}
											</p>
											<p className='font-medium text-gray-700'>
												{property.attributes.ceiling_height} մ
											</p>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				)

			case 'land':
				return (
					<div className='grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6'>
						{'attributes' in property &&
							property.attributes &&
							property.attributes.area_acres != null && (
								<div className='flex items-center'>
									<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2'>
										<Maximize className='w-6 h-6 text-blue-600' />
									</div>
									<div>
										<p className='text-xs text-gray-500'>
											{getAttributeLabel('area_acres')}
										</p>
										<p className='font-medium text-gray-700'>
											{property.attributes.area_acres.toLocaleString()} {t.sqft}
										</p>
									</div>
								</div>
							)}
					</div>
				)

			default:
				return null
		}
	}, [property, getAttributeLabel])

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50'>
				<div className='text-center'>
					<Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
					<p className='text-blue-800 font-medium'>
						{t.loadingPropertyText}
					</p>
				</div>
			</div>
		)
	}

	if (error || !property) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-orange-50'>
				<div className='text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg'>
					<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
						<Info className='w-8 h-8 text-red-600' />
					</div>
					<p className='text-red-600 text-lg font-medium mb-4'>
						{error || 'Property not found'}
					</p>
					<Link
						href='/properties'
						className='mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
					>
						<ChevronLeft className='w-4 h-4 mr-2' />
						{t.backToListings}
					</Link>
				</div>
			</div>
		)
	}

	const propertyTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
		house: Home,
		apartment: Building2,
		commercial: Landmark,
		land: Trees,
	}

	const PropertyIcon = propertyTypeIcons[property.property_type] || Home

	const listingTypeColors: Record<string, string> = {
		sale: 'bg-emerald-100 text-emerald-800 border-emerald-200',
		rent: 'bg-blue-100 text-blue-800 border-blue-200',
		daily_rent: 'bg-purple-100 text-purple-800 border-purple-200',
		default: 'bg-gray-100 text-gray-800 border-gray-200',
	}

	const getStatusColor = (status: PropertyStatus | string ) => {
		const statusStr =
			typeof status === 'object' ? status?.name || 'active' : String(status)

		const statusColors: Record<string, string> = {
			active: 'bg-green-100 text-green-800 border-green-200',
			pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			sold: 'bg-red-100 text-red-800 border-red-200',
			rented: 'bg-purple-100 text-purple-800 border-purple-200',
			inactive: 'bg-gray-100 text-gray-800 border-gray-200',
			default: 'bg-blue-100 text-blue-800 border-blue-200',
		}

		return statusColors[statusStr.toLowerCase()] || statusColors.default
	}

	const getShareText = (language: string) => {
		switch (language) {
			case 'hy':
				return 'Կիսվել'
			case 'ru':
				return 'Поделиться'
			default:
				return 'Share'
		}
	}

	const getCopyLinkText = (language: string) => {
		switch (language) {
			case 'hy':
				return 'Պատճենել հղումը'
			case 'ru':
				return 'Копировать ссылку'
			default:
				return 'Copy link'
		}
	}


	const getListingTypeColor = (listingType: string) => {
		return listingTypeColors[listingType] || listingTypeColors.default
	}

	// Check if property has valid coordinates for map
	const hasValidCoordinates =
		property.latitude &&
		property.longitude &&
		property.latitude !== 0 &&
		property.longitude !== 0

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
		<div className='min-h-screen bg-gray-50'>
			{/* Navigation */}
			<div className='bg-white shadow-sm z-10 print:hidden'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center py-4'>
						<Link
							href='/properties'
							className='inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors'
						>
							<ChevronLeft className='w-5 h-5 mr-1' />
							{t.backToListings}
						</Link>
						<div className='flex items-center space-x-3'>
							<span
								onClick={() => setShowShareOptions(!showShareOptions)}
								className='p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative'
								aria-label='Share property'
							>
								<Share2 className='w-5 h-5' />

								{showShareOptions && (
									<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-100'>
										<div className='py-1'>
											<button
												onClick={copyLinkToClipboard}
												className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center'
											>
												<Copy className='w-4 h-4 mr-2' />
												{getCopyLinkText(language)}
											</button>
											<button
												onClick={handleShare}
												className='w-full text-left px-4 py-2 gap-1 hover:bg-gray-100 flex items-center'
												aria-label='Share property'
											>
												<Share2 className='w-5 h-5' />
												{getShareText(language)}
											</button>
										</div>
									</div>
								)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Map Popup Modal */}
			{showMapPopup && hasValidCoordinates && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center p-4'
					style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // прозрачный черный фон
					onClick={() => setShowMapPopup(false)} // клик по фону закрывает
				>
					<div
						className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'
						onClick={e => e.stopPropagation()} // клик внутри окна не закрывает
					>
						<div className='p-4 border-b border-gray-200 flex items-center justify-between'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900'>
									{t.location}
								</h3>
								<p className='text-sm text-gray-600'>{property.address}</p>
							</div>
							<button
								onClick={() => setShowMapPopup(false)}
								className='p-2 hover:bg-gray-100 rounded-full transition-colors'
							>
								<X className='w-5 h-5 text-gray-500' />
							</button>
						</div>
						<div className='h-[500px]'>
							<YandexMap
								latitude={property.latitude!}
								longitude={property.longitude!}
								address={`${property.address}, ${property.city?.name}, ${property.state?.name}`}
								title={property.title}
								isPopup={true}
								onClose={() => setShowMapPopup(false)}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className='max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'>
				<div className='px-4 sm:px-0'>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Left Column (Images and Details) */}
						<div className='lg:col-span-2'>
							{/* Enhanced Image Gallery */}
							<div className='bg-gray-900 rounded-lg overflow-hidden mb-6'>
								<div className='relative h-[50vh] md:h-[60vh]'>
									{property.images && property.images.length > 0 ? (
										<>
											{property.images[selectedImage].type === 'image' ? (
												<div
													className='relative w-full h-full cursor-pointer group'
													onClick={handleImageClick}
												>
													<Image
														src={getImageUrl(
															property.images[selectedImage].url
														)}
														alt={property.title}
														fill
														className='object-cover transition-all duration-700'
														priority
													/>
													{/* Tap to view indicator for mobile */}
													<div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
														<div className='opacity-0 group-hover:opacity-100 transition-opacity md:hidden bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium'>
															Tap to view gallery
														</div>
													</div>
												</div>
											) : property.images[selectedImage].type === 'video' ? (
												<div
													className='w-full h-full bg-black flex items-center justify-center cursor-pointer relative group'
													onClick={handleImageClick}
												>
													{/* Video thumbnail with enhanced preview */}
													{property.images[selectedImage].thumbnail_url ? (
														<>
															<Image
																src={getImageUrl(
																	property.images[selectedImage].thumbnail_url!
																)}
																alt={`Video thumbnail ${selectedImage + 1}`}
																fill
																className='object-cover'
															/>
															<div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10'>
																<div className='bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg'>
																	<Play className='w-10 h-10 text-gray-800 ml-1' />
																</div>
															</div>

															{/* HD indicator */}
															<div className='absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold'>
																HD VIDEO
															</div>
														</>
													) : (
														<>
															<video
																src={getImageUrl(
																	property.images[selectedImage].url
																)}
																className='w-full h-full object-contain'
																muted
																preload='metadata'
																poster={`${getImageUrl(
																	property.images[selectedImage].url
																)}#t=1`}
															>
																Your browser does not support the video tag.
															</video>
															<div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10'>
																<div className='bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg'>
																	<Play className='w-10 h-10 text-gray-800 ml-1' />
																</div>
															</div>
															{/* Video indicator for no thumbnail */}
															<div className='absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold'>
																VIDEO
															</div>
														</>
													)}
													{/* Tap to play indicator for mobile */}
													<div className='absolute bottom-16 left-1/2 transform -translate-x-1/2 md:hidden opacity-70'>
														<div className='bg-black/60 text-white px-3 py-1 rounded-full text-xs'>
															Tap to play
														</div>
													</div>
												</div>
											) : (
												<div
													className='w-full h-full bg-gray-300 flex items-center justify-center cursor-pointer'
													onClick={handleImageClick}
												>
													<span className='text-gray-500'>
														Unsupported media type
													</span>
												</div>
											)}

											{/* Enhanced gradient overlay */}
											<div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none'></div>

											{/* Enhanced Navigation arrows - larger for mobile */}
											<button
												onClick={e => {
													e.stopPropagation()
													prevImage()
												}}
												className='absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all z-20 touch-manipulation'
												aria-label='Previous image'
											>
												<ChevronLeft className='w-6 h-6 md:w-6 md:h-6' />
											</button>
											<button
												onClick={e => {
													e.stopPropagation()
													nextImage()
												}}
												className='absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all z-20 touch-manipulation'
												aria-label='Next image'
											>
												<ChevronRight className='w-6 h-6 md:w-6 md:h-6' />
											</button>

											{/* Enhanced image counter */}
											<div className='absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm'>
												<span className='font-bold'>{selectedImage + 1}</span>
												<span className='mx-1 opacity-70'>/</span>
												<span>{property.images.length}</span>
											</div>

											{/* Mobile swipe indicator */}
											{property.images.length > 1 && (
												<div className='absolute bottom-16 left-1/2 transform -translate-x-1/2 md:hidden'>
													<div className='bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm animate-pulse'>
														← Swipe for more →
													</div>
												</div>
											)}
										</>
									) : (
										<div className='w-full h-full bg-gray-300 flex items-center justify-center'>
											<span className='text-gray-500'>No images available</span>
										</div>
									)}
								</div>

								{/* Enhanced thumbnail strip - improved for mobile */}
								{property.images && property.images.length > 1 && (
									<div className='bg-white'>
										{/* Mobile thumbnail strip */}
										<div className='md:hidden overflow-x-auto py-3 px-4'>
											<div className='flex gap-2 pb-1'>
												{property.images.map((media, index) => (
													<button
														key={media.id}
														onClick={() => setSelectedImage(index)}
														className={`relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden transition-all touch-manipulation ${
															selectedImage === index
																? 'ring-2 ring-blue-500 scale-105'
																: 'opacity-70 hover:opacity-100'
														}`}
													>
														{media.type === 'image' ? (
															<Image
																src={getImageUrl(media.url)}
																alt={`${property.title} - ${index + 1}`}
																fill
																className='object-cover'
															/>
														) : media.type === 'video' ? (
															<div className='w-full h-full bg-gray-800 flex items-center justify-center relative'>
																<Play className='w-4 h-4 text-white absolute z-10' />
																{media.thumbnail_url ? (
																	<Image
																		src={getImageUrl(media.thumbnail_url)}
																		alt={`Video thumbnail ${index + 1}`}
																		fill
																		className='object-cover opacity-70'
																	/>
																) : (
																	<div className='w-full h-full bg-gray-700 flex items-center justify-center'>
																		<span className='text-xs text-white font-bold'>
																			VID
																		</span>
																	</div>
																)}
															</div>
														) : (
															<div className='w-full h-full bg-gray-300 flex items-center justify-center'>
																<span className='text-xs text-gray-500'>
																	FILE
																</span>
															</div>
														)}
													</button>
												))}
											</div>
										</div>

										{/* Desktop thumbnail strip */}
										<div className='hidden md:flex overflow-x-auto py-4 px-4 gap-2'>
											{property.images.map((media, index) => (
												<button
													key={media.id}
													onClick={() => setSelectedImage(index)}
													className={`relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden transition-all ${
														selectedImage === index
															? 'ring-2 ring-blue-500 scale-105'
															: 'opacity-70 hover:opacity-100'
													}`}
												>
													{media.type === 'image' ? (
														<Image
															src={getImageUrl(media.url)}
															alt={`${property.title} - ${index + 1}`}
															fill
															className='object-cover'
														/>
													) : media.type === 'video' ? (
														<div className='w-full h-full bg-gray-800 flex items-center justify-center relative'>
															<Play className='w-6 h-6 text-white absolute z-10' />
															{media.thumbnail_url ? (
																<Image
																	src={getImageUrl(media.thumbnail_url)}
																	alt={`Video thumbnail ${index + 1}`}
																	fill
																	className='object-cover opacity-70'
																/>
															) : (
																<div className='w-full h-full bg-gray-700 flex items-center justify-center'>
																	<span className='text-xs text-white'>
																		Video
																	</span>
																</div>
															)}
														</div>
													) : (
														<div className='w-full h-full bg-gray-300 flex items-center justify-center'>
															<span className='text-xs text-gray-500'>
																File
															</span>
														</div>
													)}
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Title and Address Bar (Mobile Only) */}
							<div className='block lg:hidden mb-6'>
								<div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
									<div className='flex items-center gap-2 mb-3'>
										{/* Property Status Badge */}
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(
												property.status
											)}`}
										>
											{React.createElement(getStatusIcon(property.status), {
												className: 'w-3 h-3 mr-1',
											})}
											{getTranslatedStatus(property.status, language).label}
										</span>
										{/* Listing Type Badge */}
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getListingTypeColor(
												property.listing_type
											)}`}
										>
											<Tag className='w-3 h-3 mr-1' />
											{getListingTypeLabel(property.listing_type)}
										</span>
									</div>
									<h1 className='text-2xl font-bold text-gray-900 mb-2'>
										{getTranslatedContent(property, 'title', language)}
									</h1>
									<div className='flex items-center text-gray-600 mb-4'>
										<MapPin className='w-5 h-5 mr-2 flex-shrink-0 text-blue-600' />
										<span className='text-sm'>
											{property.state
												? property.district
													? `${getTranslatedDistrictName(
															property.district,
															language
													  )}, ${getTranslatedStateName(
															property.state.name,
															language
													  )}`
													: property.city
													? `${getTranslatedCityName(
															property.city.name,
															language
													  )}, ${getTranslatedStateName(
															property.state.name,
															language
													  )}`
													: getTranslatedStateName(
															property.state.name,
															language
													  )
												: ''}
										</span>
									</div>

									{/* Property Tags for Mobile */}
									<div className='flex flex-wrap items-center gap-2 mb-4'>
										<div className='flex items-center px-3 py-2 bg-gray-100 rounded-lg'>
											<PropertyIcon className='w-5 h-5 text-gray-700 mr-2' />
											<span className='font-medium text-gray-700'>
												{getPropertyTypeLabel(property.property_type)}
											</span>
										</div>
										<div className='flex items-center px-3 py-2 bg-gray-100 rounded-lg'>
											<Tag className='w-5 h-5 text-gray-700 mr-2' />
											<span className='font-medium text-gray-700'>
												ID: {property.custom_id}
											</span>
										</div>
									</div>

									{/* Mobile Property Attributes */}
									{getPropertyAttributes()}

									{property.url_3d && property.url_3d.trim() !== '' && (
										<div className='bg-white rounded-xl shadow-sm p-2 border border-gray-100 mb-6'>
											<a
												href={property.url_3d}
												target='_blank'
												rel='noopener noreferrer'
												className='
          w-full flex items-center justify-center
          text-blue-600
          px-2 py-1
          rounded-full
          gap-2 text-[18px] font-bold
          backdrop-blur-sm
          transition-all duration-200
        '
											>
												<FaVrCardboard className='w-6 h-6' />
												<span>
													{
														{
															hy: 'Դիտել 3D տարբերակով',
															en: 'View in 3D',
															ru: 'Смотреть в 3D',
														}[language]
													}
												</span>{' '}
											</a>
										</div>
									)}

									{/* Price for Mobile */}
									<div className='mt-4'>
										<CurrencyDisplay
											amount={property.price}
											originalCurrency={property.currency || 'USD'}
											listingType={property.listing_type}
											language={language}
										/>
									</div>

									{/* Contact Button for Mobile */}
									<div className='mt-6'>
										<button
											onClick={() => setShowContactPopup(true)}
											className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'
										>
											<Phone className='w-5 h-5 mr-2' />
											{t.contactAgent}
										</button>
									</div>

									{/* Property Stats for Mobile */}
									<div className='pt-4 mt-4 border-t border-gray-100'>
										<div className='flex justify-between items-center py-2'>
											<span className='text-gray-600 flex items-center'>
												<Eye className='w-4 h-4 mr-2' /> {t.views}
											</span>
											<span className='font-medium text-gray-700'>
												{property.views}
											</span>
										</div>
										<div className='flex justify-between items-center py-2'>
											<span className='text-gray-600 flex items-center'>
												<Calendar className='w-4 h-4 mr-2' /> {t.listed}
											</span>
											<span className='font-medium text-gray-700'>
												{formatLocalizedDate(
													property.created_at,
													language as 'hy' | 'en' | 'ru'
												)}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Property Description */}
							<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6 mt-6'>
								<h2 className='text-xl font-semibold mb-4 text-gray-900'>
									{t.overview}
								</h2>
								<div>
									{getTranslatedContent(property, 'description', language) ? (
										<p className='text-sm text-gray-700 leading-relaxed'>
											{getTranslatedContent(property, 'description', language)}
										</p>
									) : (
										<div className='flex items-center gap-2 text-sm text-muted-foreground italic'>
											<FileText className='w-4 h-4 text-gray-600' />
											<span className='text-gray-600'>{t.noDescription}</span>
										</div>
									)}
								</div>
							</div>

							{/* Features Section */}
							{property.features && property.features.length > 0 && (
								<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6'>
									<h2 className='text-xl font-semibold mb-4 text-gray-900'>
										{t.featuresAndAmenities}
									</h2>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
										{property.features.map(feature => (
											<div
												key={feature.id}
												className='flex items-center bg-gray-50 p-4 rounded-lg'
											>
												<div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0'>
													<Check className='w-5 h-5 text-blue-600' />
												</div>
												<span className='text-gray-700'>
													{getTranslatedFeature(feature.name, language)}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Mobile Map Section */}
							<div className='block md:hidden bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6'>
								<h3 className='text-lg font-semibold mb-4 text-gray-900 flex items-center'>
									<MapPin className='w-5 h-5 mr-2 text-blue-600' />
									{t.location}
								</h3>

								{hasValidCoordinates ? (
									<>
										<YandexMap
											latitude={property.latitude!}
											longitude={property.longitude!}
											address={`${property.address}, ${property.city?.name}, ${property.state?.name}`}
											title={property.title}
										/>
										<div className='mt-4 space-y-2'>
											<p className='text-gray-900 font-medium'>
												{property.address}
											</p>
										</div>

										<button
											onClick={() => setShowMapPopup(true)}
											className='w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium'
										>
											<Maximize2 className='w-4 h-4 mr-2' />
											{t.viewOnMap}
										</button>
									</>
								) : (
									<>
										<div className='bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500 mb-4'>
											<div className='text-center'>
												<MapPin className='w-12 h-12 mx-auto mb-2 text-gray-400' />
												<p className='text-sm'>
													Location coordinates not available
												</p>
											</div>
										</div>
										<div className='space-y-2'>
											<p className='text-gray-900 font-medium'>
												{property.address}
											</p>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Right Column (Desktop Only) */}
						<div className='lg:col-span-1 hidden lg:block'>
							{/* Title and Address (Desktop Only) */}
							<div className='mb-6'>
								<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
									<div className='flex items-center gap-2 mb-3'>
										{/* Property Status Badge */}
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusColor(
												property.status
											)}`}
										>
											{React.createElement(getStatusIcon(property.status), {
												className: 'w-3 h-3 mr-1',
											})}
											{getTranslatedStatus(property.status, language).label}
										</span>
										{/* Listing Type Badge */}
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getListingTypeColor(
												property.listing_type
											)}`}
										>
											<Tag className='w-3 h-3 mr-1' />
											{getListingTypeLabel(property.listing_type)}
										</span>
									</div>
									<h1 className='text-2xl font-bold text-gray-900 mb-2'>
										{getTranslatedContent(property, 'title', language)}
									</h1>
									<div className='flex items-center text-gray-600'>
										<MapPin className='w-5 h-5 mr-2 flex-shrink-0 text-blue-600' />
										<span>
											{property.state
												? property.district
													? `${getTranslatedDistrictName(
															property.district,
															language
													  )}, ${getTranslatedStateName(
															property.state.name,
															language
													  )}`
													: property.city
													? `${getTranslatedCityName(
															property.city.name,
															language
													  )}, ${getTranslatedStateName(
															property.state.name,
															language
													  )}`
													: getTranslatedStateName(
															property.state.name,
															language
													  )
												: ''}
										</span>
									</div>
								</div>
							</div>
							{property.url_3d && property.url_3d.trim() !== '' && (
								<div className='bg-white rounded-xl shadow-sm p-2 border border-gray-100 mb-6'>
									<a
										href={property.url_3d}
										target='_blank'
										rel='noopener noreferrer'
										className='
          w-full flex items-center justify-center
          text-blue-600
          px-2 py-1
          rounded-full
          gap-2 text-[18px] font-bold
          backdrop-blur-sm
          transition-all duration-200
        '
									>
										<FaVrCardboard className='w-6 h-6' />
										<span>
											{
												{
													hy: 'Դիտել 3D տարբերակով',
													en: 'View in 3D',
													ru: 'Смотреть в 3D',
												}[language]
											}
										</span>{' '}
									</a>
								</div>
							)}

							{/* Price Card with Currency Conversion (Desktop Only) */}
							<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6'>
								<CurrencyDisplay
									amount={property.price}
									originalCurrency={property.currency || 'USD'}
									listingType={property.listing_type}
									language={language}
								/>

								{/* Property Tags */}
								<div className='flex flex-wrap items-center gap-2 mt-6 mb-6'>
									<div className='flex items-center px-3 py-2 bg-gray-100 rounded-lg'>
										<PropertyIcon className='w-5 h-5 text-gray-700 mr-2' />
										<span className='font-medium text-gray-700'>
											{getPropertyTypeLabel(property.property_type)}
										</span>
									</div>

									<div className='flex items-center px-3 py-2 bg-gray-100 rounded-lg'>
										<Tag className='w-5 h-5 text-gray-700 mr-2' />
										<span className='font-medium text-gray-700'>
											ID: {property.custom_id}
										</span>
									</div>
								</div>

								{getPropertyAttributes()}

								{/* Contact Buttons */}
								<div className='space-y-3 mb-6'>
									<button
										onClick={() => setShowContactPopup(true)}
										className='w-full block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'
									>
										<Phone className='w-5 h-5 mr-2' />
										{t.contactAgent}
									</button>
								</div>

								{/* Property Stats */}
								<div className='pt-4 mt-4 border-t border-gray-100'>
									<div className='flex justify-between items-center py-2'>
										<span className='text-gray-600 flex items-center'>
											<Eye className='w-4 h-4 mr-2' /> {t.views}
										</span>
										<span className='font-medium text-gray-700'>
											{property.views}
										</span>
									</div>
									<div className='flex justify-between items-center py-2'>
										<span className='text-gray-600 flex items-center'>
											<Calendar className='w-4 h-4 mr-2' /> {t.listed}
										</span>
										<span className='font-medium text-gray-700'>
											{formatLocalizedDate(
												property.created_at,
												language as 'hy' | 'en' | 'ru'
											)}
										</span>
									</div>
								</div>
							</div>

							{/* Enhanced Map Preview (Desktop Only) */}
							<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
								<h3 className='text-lg font-semibold mb-4 text-gray-900 flex items-center'>
									<MapPin className='w-5 h-5 mr-2 text-blue-600' />
									{t.location}
								</h3>

								{hasValidCoordinates ? (
									<>
										<YandexMap
											latitude={property.latitude!}
											longitude={property.longitude!}
											address={`${property.address}, ${property.city?.name}, ${property.state?.name}`}
											title={property.title}
										/>
										<div className='mt-4 space-y-2'>
											<p className='text-gray-900 font-medium'>
												{property.address}
											</p>
										</div>

										<button
											onClick={() => setShowMapPopup(true)}
											className='w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium'
										>
											<Maximize2 className='w-4 h-4 mr-2' />
											{t.viewOnMap}
										</button>
									</>
								) : (
									<>
										<div className='bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500 mb-4'>
											<div className='text-center'>
												<MapPin className='w-12 h-12 mx-auto mb-2 text-gray-400' />
												<p className='text-sm'>
													Location coordinates not available
												</p>
											</div>
										</div>
										<div className='space-y-2'>
											<p className='text-gray-900 font-medium'>
												{property.address}
											</p>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Enhanced Full Gallery Modal with better mobile support */}
			{showFullGallery && property.images && (
				<div className='fixed inset-0 bg-black/95 z-50 flex flex-col'>
					<div className='flex items-center justify-between p-4 backdrop-blur-sm border-b border-white/10'>
						<div className='flex items-center space-x-3'>
							<span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium'>
								{galleryIndex + 1} / {property.images.length}
							</span>
						</div>
						<div className='absolute left-1/2 -translate-x-1/2 text-white text-lg md:block hidden'>
							{property.title}
						</div>
						<button
							onClick={() => {
								setShowFullGallery(false)
								setGalleryIndex(0)
							}}
							className='text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors'
							aria-label='Close gallery'
						>
							<X className='w-6 h-6' />
						</button>
					</div>
					<div
						className='flex-1 relative overflow-hidden'
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
					>
						{/* Current media display */}
						<div className='absolute inset-0 flex items-center justify-center p-4'>
							{property.images[galleryIndex].type === 'image' ? (
								<div className='relative w-full h-full max-w-6xl'>
									<Image
										src={getImageUrl(property.images[galleryIndex].url)}
										alt={`${property.title} - ${galleryIndex + 1}`}
										fill
										className='object-contain'
										priority
									/>
								</div>
							) : property.images[galleryIndex].type === 'video' ? (
								<div className='w-full h-full max-w-6xl flex items-center justify-center'>
									<video
										src={getImageUrl(property.images[galleryIndex].url)}
										controls
										className='max-w-full max-h-full object-contain rounded-lg'
										poster={
											property.images[galleryIndex].thumbnail_url
												? getImageUrl(
														property.images[galleryIndex].thumbnail_url!
												  )
												: undefined
										}
										preload='metadata'
									>
										Your browser does not support the video tag.
									</video>
								</div>
							) : (
								<div className='flex items-center justify-center'>
									<div className='text-center'>
										<FileText className='w-16 h-16 text-gray-400 mx-auto mb-2' />
										<span className='text-gray-400'>
											Unsupported media type
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Navigation arrows */}
						{galleryIndex > 0 && (
							<button
								onClick={prevGalleryImage}
								className='absolute left-4 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-2xl transition-all z-20 backdrop-blur-sm'
								aria-label='Previous image'
							>
								<ChevronLeft className='w-6 h-6 md:w-8 md:h-8' />
							</button>
						)}

						{galleryIndex < property.images.length - 1 && (
							<button
								onClick={nextGalleryImage}
								className='absolute right-4 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-2xl transition-all z-20 backdrop-blur-sm'
								aria-label='Next image'
							>
								<ChevronRight className='w-6 h-6 md:w-8 md:h-8' />
							</button>
						)}

						{/* Swipe indicator for mobile */}
						<div className='absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden bg-black/60 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm'>
							← Swipe to navigate →
						</div>
					</div>

					{/* Caption */}
					{property.images[galleryIndex].caption && (
						<div className='bg-black/80 backdrop-blur-sm p-4 border-t border-white/10'>
							<p className='text-white text-sm leading-relaxed max-w-4xl mx-auto'>
								{property.images[galleryIndex].caption}
							</p>
						</div>
					)}
					{/* Thumbnail strip */}
					<div className='backdrop-blur-sm border-t border-white/10 p-4'>
						<div className='max-w-6xl mx-auto overflow-x-auto'>
							<div className='flex gap-2 pb-2 justify-center'>
								{property.images.map((media, index) => (
									<button
										key={media.id}
										onClick={() => setGalleryIndex(index)}
										className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
											galleryIndex === index
												? 'ring-2 ring-blue-500 scale-105'
												: 'opacity-60 hover:opacity-100'
										}`}
									>
										{media.type === 'image' ? (
											<Image
												src={getImageUrl(media.url)}
												alt={`Thumbnail ${index + 1}`}
												fill
												className='object-cover'
											/>
										) : media.type === 'video' ? (
											<div className='w-full h-full bg-gray-800 flex items-center justify-center relative'>
												<Play className='w-4 h-4 text-white absolute z-10' />
												{media.thumbnail_url && (
													<Image
														src={getImageUrl(media.thumbnail_url)}
														alt={`Video thumbnail ${index + 1}`}
														fill
														className='object-cover opacity-70'
													/>
												)}
											</div>
										) : (
											<div className='w-full h-full bg-gray-700 flex items-center justify-center'>
												<FileText className='w-4 h-4 text-white' />
											</div>
										)}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
			<ContactPopup
				isOpen={showContactPopup}
				onClose={() => setShowContactPopup(false)}
				language={language}
			/>
		</div>
	)
}
