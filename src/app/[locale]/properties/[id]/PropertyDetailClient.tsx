'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
	Globe,
	TrendingUp,
	Navigation,
	MapIcon,
	Maximize2,
	Layers3,
	CheckCircle,
	AlertCircle,
	Clock,
	XCircle,
	Phone,
} from 'lucide-react'

import { RxHeight } from 'react-icons/rx'

import Link from 'next/link'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import React from 'react'
import ymaps from 'yandex-maps'

interface PropertyDetailClientProps {
	property: Property
}

const YandexMap = ({
	latitude,
	longitude,
	address,
	title,
	isPopup = false,
	onClose,
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
	const [mapInstance, setMapInstance] = useState<ymaps.Map | null>(null)

	const mapId = isPopup ? 'yandex-map-popup' : 'yandex-map'
	const mapHeight = isPopup ? 'h-[500px]' : 'h-64'

	// Replace the useEffect in YandexMap component (around line 60-170) with this fixed version:

	useEffect(() => {
		const loadYandexMaps = () => {
			if (window.ymaps) {
				initMap()
				return
			}

			const existingScript = document.querySelector(
				'script[src*="api-maps.yandex.ru"]'
			)
			if (existingScript) {
				existingScript.addEventListener('load', () => {
					if (window.ymaps) {
						window.ymaps.ready(initMap)
					}
				})
				return
			}

			const script = document.createElement('script')
			script.src = `https://api-maps.yandex.ru/2.1/?apikey=${
				process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
			}&lang=en_US`
			script.onload = () => {
				window.ymaps.ready(initMap)
			}
			script.onerror = () => {
				console.error('Failed to load Yandex Maps API')
				setMapError(true)
			}
			document.head.appendChild(script)
		}

		const initMap = () => {
			try {
				// Clean up existing map instance
				if (mapInstance) {
					mapInstance.destroy()
					setMapInstance(null)
				}

				const mapElement = document.getElementById(mapId)
				if (!mapElement) {
					console.error(`Map container ${mapId} not found`)
					return
				}

				const zoom = isPopup ? 17 : 16
				const controls = isPopup
					? [
							'zoomControl',
							'fullscreenControl',
							'typeSelector',
							'geolocationControl',
							'routeButtonControl',
					  ]
					: ['zoomControl', 'fullscreenControl', 'typeSelector']

				const map = new window.ymaps.Map(
					mapId,
					{
						center: [latitude, longitude],
						zoom: zoom,
						controls: controls,
					},
					{
						suppressMapOpenBlock: true,
						yandexMapDisablePoiInteractivity: false,
					}
				)

				const placemark = new window.ymaps.Placemark(
					[latitude, longitude],
					{
						balloonContent: `
						<div style="padding: 12px; max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
							<h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${title}</h3>
							<p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${address}</p>
							<div style="display: flex; gap: 8px; flex-wrap: wrap;">
								<a href="https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map" 
								   target="_blank" 
								   rel="noopener noreferrer"
								   style="display: inline-flex; align-items: center; gap: 4px; color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500; padding: 4px 8px; background: #eff6ff; border-radius: 4px; transition: background-color 0.2s;">
									🗺️ Open in Yandex Maps
								</a>
								<a href="https://maps.google.com/?q=${latitude},${longitude}" 
								   target="_blank" 
								   rel="noopener noreferrer"
								   style="display: inline-flex; align-items: center; gap: 4px; color: #059669; text-decoration: none; font-size: 13px; font-weight: 500; padding: 4px 8px; background: #ecfdf5; border-radius: 4px; transition: background-color 0.2s;">
									🌍 Open in Google Maps
								</a>
							</div>
						</div>
					`,
						hintContent: title,
						iconCaption: title,
					},
					{
						preset: 'islands#redDotIconWithCaption',
						iconColor: '#dc2626',
						iconCaptionMaxWidth: 200,
						balloonCloseButton: true,
						balloonMaxWidth: 350,
						balloonOffset: [3, -40],
						balloonShadow: true,
						hideIconOnBalloonOpen: false,
						openBalloonOnClick: true,
					}
				)

				map.geoObjects.add(placemark)

				if (isPopup) {
					setTimeout(() => {
						placemark.balloon.open()
					}, 500)
				}

				if (isPopup) {
					const trafficControl = new window.ymaps.control.TrafficControl({
						providerKey: 'traffic#actual',
						trafficShown: false,
					})
					map.controls.add(trafficControl)
				}

				setMapInstance(map as unknown as ymaps.Map)
				setMapLoaded(true)
			} catch (error) {
				console.error('Error initializing Yandex Map:', error)
				setMapError(true)
			}
		}

		loadYandexMaps()

		return () => {
			if (mapInstance) {
				try {
					mapInstance.destroy()
				} catch (error) {
					console.error('Error destroying map:', error)
				}
			}
		}
	}, [latitude, longitude, address, title, isPopup, mapId]) // REMOVED mapInstance from dependencies

	// Also, you might want to create a separate useEffect for cleanup only:
	useEffect(() => {
		return () => {
			if (mapInstance) {
				try {
					mapInstance.destroy()
				} catch (error) {
					console.error('Error destroying map:', error)
				}
			}
		}
	}, []) 

	const handleGetDirections = () => {
		const yandexUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}&rtt=auto`
		window.open(yandexUrl, '_blank', 'noopener,noreferrer')
	}

	const handleViewLarger = () => {
		const yandexUrl = `https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map`
		window.open(yandexUrl, '_blank', 'noopener,noreferrer')
	}

	if (mapError) {
		return (
			<div
				className={`w-full ${mapHeight} bg-gray-100 rounded-xl flex items-center justify-center`}
			>
				<div className='text-center p-6'>
					<MapIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
					<p className='text-gray-500 text-sm mb-3'>Map could not be loaded</p>
					<div className='flex flex-col sm:flex-row gap-2 justify-center'>
						<a
							href={`https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map`}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
						>
							<Globe className='w-3 h-3 mr-1' />
							Yandex Maps
						</a>
						<a
							href={`https://maps.google.com/?q=${latitude},${longitude}`}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors'
						>
							<Globe className='w-3 h-3 mr-1' />
							Google Maps
						</a>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='relative'>
			<div
				id={mapId}
				className={`w-full ${mapHeight} rounded-xl overflow-hidden ${
					!mapLoaded ? 'hidden' : 'block'
				}`}
			/>

			{!mapLoaded && (
				<div
					className={`w-full ${mapHeight} bg-gray-100 rounded-xl flex items-center justify-center`}
				>
					<div className='text-center'>
						<Loader2 className='w-8 h-8 text-blue-600 animate-spin mx-auto mb-2' />
						<p className='text-gray-500 text-sm'>Loading map...</p>
					</div>
				</div>
			)}

			{mapLoaded && !isPopup && (
				<div className='absolute bottom-3 right-3 flex gap-2'>
					<button
						onClick={handleGetDirections}
						className='bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors text-xs font-medium border border-gray-200'
						title='Get directions'
					>
						<Navigation className='w-4 h-4 mr-1 inline' />
						Directions
					</button>
					<button
						onClick={handleViewLarger}
						className='bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors text-xs font-medium border border-gray-200'
						title='View larger map'
					>
						<Maximize2 className='w-4 h-4 mr-1 inline' />
						Expand
					</button>
				</div>
			)}

			{isPopup && onClose && (
				<button
					onClick={onClose}
					className='absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors border border-gray-200'
					title='Close map'
				>
					<X className='w-4 h-4 text-gray-600' />
				</button>
			)}

			{isPopup && mapLoaded && (
				<div className='absolute bottom-3 left-3 right-3 flex justify-between items-end'>
					<div className='bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200'>
						<p className='text-xs font-medium text-gray-800 mb-1'>{title}</p>
						<p className='text-xs text-gray-600'>{address}</p>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={handleGetDirections}
							className='bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-xs font-medium'
						>
							<Navigation className='w-4 h-4 mr-1 inline' />
							Directions
						</button>
						<button
							onClick={handleViewLarger}
							className='bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors text-xs font-medium'
						>
							<Globe className='w-4 h-4 mr-1 inline' />
							Yandex Maps
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const API_BASE_URL = 'https://realty-app-admin.vercel.app'

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
	const conversionOptions = useMemo(
		() => ({
			autoFetch: true,
			refreshInterval: 30 * 60 * 1000,
			targetCurrencies: ['RUB', 'AMD'],
		}),
		[]
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
		alert(getLinkCopiedText(language))
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
				hy: 'Մակերես (ակր)',
				ru: 'Площадь (акры)',
				en: 'Area (acres)',
			},
		}
		return labels[key]?.[language] || key
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
												{property.attributes.ceiling_height}
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
												{property.attributes.area_sqft.toLocaleString()} {t.sqft}
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
												{property.attributes.ceiling_height}
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
												{property.attributes.area_sqft.toLocaleString()} {t.sqft}
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
												{property.attributes.ceiling_height}
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
											{property.attributes.area_acres.toLocaleString()} acres
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
						Loading property details...
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
						Back to properties
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

	const getLinkCopiedText = (language: string) => {
		switch (language) {
			case 'hy':
				return 'Հղումը պատճենվել է!'
			case 'ru':
				return 'Ссылка скопирована!'
			default:
				return 'Link copied to clipboard!'
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
							<button
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
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Map Popup Modal */}
			{showMapPopup && hasValidCoordinates && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
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
														className='object-cover transition-all duration-700 group-hover:scale-110'
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

											{/* Enhanced View all button */}
											{property.images.length > 1 && (
												<button
													onClick={e => {
														e.stopPropagation()
														setShowFullGallery(true)
													}}
													className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-white transition-all duration-200 flex items-center space-x-2'
												>
													<svg
														className='w-4 h-4'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
														/>
													</svg>
													<span>View all media</span>
												</button>
											)}

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
										<button className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'>
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
												<div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0'>
													<Check className='w-5 h-5 text-green-600' />
												</div>
												<span className='text-gray-700'>
													{getTranslatedFeature(feature.name, language)}
												</span>
											</div>
										))}
									</div>
								</div>
							)}
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
									<a
										href='tel:+37441194646'
										className='w-full block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center'
									>
										<Phone className='w-5 h-5 mr-2' />
										{t.contactAgent}
									</a>
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
				<div className='fixed inset-0 bg-black z-50 overflow-y-auto'>
					{/* Enhanced header */}
					<div className='flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800'>
						<div className='flex items-center space-x-3'>
							<h3 className='text-xl font-medium text-white'>All Media</h3>
							<span className='bg-white/20 text-white px-2 py-1 rounded-full text-sm'>
								{property.images.length} items
							</span>
						</div>
						<button
							onClick={() => setShowFullGallery(false)}
							className='text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors'
							aria-label='Close gallery'
						>
							<X className='w-6 h-6' />
						</button>
					</div>

					{/* Enhanced media grid */}
					<div className='max-w-6xl mx-auto p-4 space-y-6'>
						{property.images.map((media, index) => (
							<div
								key={media.id}
								className='bg-gray-900 rounded-2xl overflow-hidden shadow-2xl'
							>
								{/* Media counter */}
								<div className='bg-gray-800 px-4 py-2 flex items-center justify-between'>
									<span className='text-white text-sm font-medium'>
										{index + 1} of {property.images.length}
									</span>
									{media.type === 'video' && (
										<span className='bg-red-500 text-white px-2 py-1 rounded text-xs font-bold'>
											VIDEO
										</span>
									)}
								</div>

								<div className='relative'>
									{media.type === 'image' ? (
										<div className='relative h-[60vh] md:h-[70vh]'>
											<Image
												src={getImageUrl(media.url)}
												alt={`${property.title} - ${index + 1}`}
												fill
												className='object-contain'
												priority={index === 0}
											/>
										</div>
									) : media.type === 'video' ? (
										<div className='relative h-[60vh] md:h-[70vh] flex items-center justify-center p-4'>
											<video
												src={getImageUrl(media.url)}
												controls
												className='max-w-full max-h-full object-contain rounded-lg'
												poster={
													media.thumbnail_url
														? getImageUrl(media.thumbnail_url)
														: undefined
												}
												preload='metadata'
											>
												Your browser does not support the video tag.
											</video>
										</div>
									) : (
										<div className='h-[60vh] bg-gray-300 flex items-center justify-center'>
											<div className='text-center'>
												<FileText className='w-16 h-16 text-gray-500 mx-auto mb-2' />
												<span className='text-gray-500'>
													Unsupported media type
												</span>
											</div>
										</div>
									)}
								</div>

								{/* Media caption */}
								{media.caption && (
									<div className='bg-gray-800 p-4 border-t border-gray-700'>
										<p className='text-white text-sm leading-relaxed'>
											{media.caption}
										</p>
									</div>
								)}
							</div>
						))}
					</div>

					{/* Bottom navigation for mobile */}
					<div className='md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-4 border-t border-gray-800'>
						<div className='flex items-center justify-center space-x-4'>
							<button
								onClick={() => setShowFullGallery(false)}
								className='bg-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-colors'
							>
								Close Gallery
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
