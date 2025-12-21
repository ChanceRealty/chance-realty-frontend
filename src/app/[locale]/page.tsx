"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PropertyCard from '../_components/PropertyCard'
import { Property } from '@/types/property'
import { getRecentProperties } from '@/services/propertyService'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'
import {
	Home,
	Building2,
	Landmark,
	Trees,
	ArrowRight,
	Clapperboard,
} from 'lucide-react'
import Image from 'next/image'
import PromoVideoSection from '../_components/PromoVideoSection'

export default function HomePage() {
	const t = useTranslations()
	const { language } = useLanguage()
	const [recentProperties, setRecentProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)


	useEffect(() => {
		const fetchProperties = async () => {
			try {
				const recent = await getRecentProperties(100) 

				if (!recent || recent.length === 0) {
					setRecentProperties([])
					return
				}

				const exclusive = recent.filter(p => p.is_exclusive)
				const nonExclusive = recent.filter(p => !p.is_exclusive)

				exclusive.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				)
				nonExclusive.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				)

				const MAX_PROPERTIES = 9
				const finalProperties = [
					...exclusive,
					...nonExclusive.slice(
						0,
						Math.max(0, MAX_PROPERTIES - exclusive.length)
					),
				]

				setRecentProperties(finalProperties.slice(0, MAX_PROPERTIES))
			} catch (error) {
				console.error('Error fetching properties:', error)
				setRecentProperties([])
			} finally {
				setLoading(false)
			}
		}

		fetchProperties()
	}, [])
	


		return (
			<div className='min-h-screen'>
				{/* Hero Section */}
				<div className='relative h-[600px]'>
					{/* Фоновое изображение */}
					<div className='absolute inset-0 z-0'>
						{/* <Image
							src='/yerevan.jpg' 
							alt='Hero background'
							fill
							className='object-cover object-center'
							priority
						/> */}
						<video
							src='/vv2.mp4'
							autoPlay
							muted
							loop
							playsInline
							className='w-full md:max-w-full h-full object-cover'
						/>

						{/* <Image
								src='/cclogo.png'
								alt='Hero background'
								fill
								className='object-cover object-center'
								priority
							/> */}
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
							</div>
						</div>
					</div>
				</div>
				<PromoVideoSection />
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
						<div className='mt-16 text-center'>
							<Link
								href={`/${language}/ads`}
								className='group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg relative overflow-hidden'
							>
								<span className='relative z-10 flex items-center'>
									<span className='mr-3'>
										<Clapperboard />
									</span>
									{t.watchAllAds}
									<ArrowRight className='ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300' />
								</span>
							</Link>
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
						<div className='inline-flex items-center justify-center w-40 h-40 bg-white rounded-full mb-8 shadow-2xl animate-bounce'>
							<Image
								src='/cclogo2.png'
								alt=''
								width={96}
								height={96}
								className='absolute inset-0 w-full h-full object-contain'
							/>
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