'use client'

import LanguageSwitcher from '@/components/Translations/LanguageSwitcher'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import SearchSection from './SearchSection'
import { FaVrCardboard } from 'react-icons/fa'

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const pathname = usePathname()
	const [openDropdown, setOpenDropdown] = useState<string | null>(null)

	const pathParts = pathname.split('/')
	const currentLang = (
		['hy', 'en', 'ru'].includes(pathParts[1]) ? pathParts[1] : 'hy'
	) as 'hy' | 'en' | 'ru'

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
				setIsMenuOpen(false)
			}
		}
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [isMenuOpen])

	const navTranslations = {
		hy: {
			buy: 'Գնել',
			rent: 'Վարձակալել',
			contact: 'Կապ մեզ հետ',
			about: 'Մեր մասին',
			houses: 'Տներ',
			apartments: 'Բնակարաններ',
			commercial: 'Կոմերցիոն',
			land: 'Հողատարածքներ',
			dailyRent: 'Օրավարձ',
			dTour: '3D Բնակարաններ',
		},
		en: {
			buy: 'Buy',
			rent: 'Rent',
			contact: 'Contact',
			about: 'About',
			houses: 'Houses',
			apartments: 'Apartments',
			commercial: 'Commercial',
			land: 'Land',
			dailyRent: 'Daily Rent',
			dTour: '3D Apartments',
		},
		ru: {
			buy: 'Купить',
			rent: 'Арендовать',
			contact: 'Контакты',
			about: 'О нас',
			houses: 'Дома',
			apartments: 'Квартиры',
			commercial: 'Коммерческая',
			land: 'Земельные участки',
			dailyRent: 'Посуточная аренда',
			dTour: '3D Квартиры',
		},
	}
	const t = navTranslations[currentLang]

	const navItems = [
		{
			label: t.buy,
			href: `/${currentLang}/properties?listing_type=sale`,
			dropdown: [
				{
					label: t.houses,
					href: `/${currentLang}/properties?property_type=house&listing_type=sale`,
				},
				{
					label: t.apartments,
					href: `/${currentLang}/properties?property_type=apartment&listing_type=sale`,
				},
				{
					label: t.commercial,
					href: `/${currentLang}/properties?property_type=commercial&listing_type=sale`,
				},
				{
					label: t.land,
					href: `/${currentLang}/properties?property_type=land&listing_type=sale`,
				},
			],
		},
		{
			label: t.rent,
			href: `/${currentLang}/properties?listing_type=rent`,
			dropdown: [
				{
					label: t.houses,
					href: `/${currentLang}/properties?property_type=house&listing_type=rent`,
				},
				{
					label: t.apartments,
					href: `/${currentLang}/properties?property_type=apartment&listing_type=rent`,
				},
				{
					label: t.dailyRent,
					href: `/${currentLang}/properties?listing_type=daily_rent`,
				},
			],
		},
		{ label: t.contact, href: `/${currentLang}/contact` },
		{ label: t.about, href: `/${currentLang}/about` },
		{ label: t.dTour, href: `/${currentLang}/properties?3d=true` },
	]

	const getNavItemClass = (href: string) => {
		const isActive = pathname.startsWith(href)
		return isActive
			? 'text-blue-600 bg-blue-50'
			: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
	}

	return (
		<header className='sticky top-0 z-50 bg-white shadow-md border-b border-gray-200'>
			<div className='container mx-auto px-4 sm:px-6'>
				<div className='flex items-center justify-between h-16 sm:h-20'>
					<Link
						href={`/${currentLang}`}
						className='flex items-center group flex-shrink-0 lg:ml-24'
					>
						<div className='relative overflow-hidden rounded-xl'>
							<Image
								src='/cclogo2.png'
								alt='Chance Realty Logo'
								width={280}
								height={160}
								className='h-45 w-45'
								priority
							/>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden lg:flex items-center space-x-1 flex-1 justify-center lg:ml-20'>
						{navItems.map(item => (
							<div key={item.label} className='relative group'>
								<Link
									href={item.href}
									className={`relative px-3 xl:px-4 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200
		${getNavItemClass(item.href)}
		after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all after:duration-300 group-hover:after:w-full`}
								>
									{item.label}
								</Link>

								{item.dropdown && (
									<div
										className='absolute left-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100
			opacity-0 invisible translate-y-2
			group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
			transition-all duration-200 z-50'
									>
										{item.dropdown.map(sub => (
											<Link
												key={sub.label}
												href={sub.href}
												className='block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition'
											>
												{sub.label}
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</nav>

					{/* Search & Language Switcher - Desktop */}
					<div className='hidden lg:flex items-center gap-3 flex-shrink-0 lg:mr-24'>
						<SearchSection />
						<LanguageSwitcher />
					</div>

					{/* Mobile Menu Button */}
					<button
						className='lg:hidden relative p-3 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-300 group mt-1'
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label='Toggle mobile menu'
					>
						<div className='relative w-6 h-5 flex flex-col justify-center'>
							<span
								className={`absolute block h-0.5 w-full bg-gray-700 rounded-full transform transition-all duration-300 ease-in-out ${
									isMenuOpen
										? 'rotate-45 top-1/2 -translate-y-1/2 bg-blue-600'
										: 'top-0'
								}`}
							></span>
							<span
								className={`absolute block h-0.5 bg-gray-700 rounded-full transform transition-all duration-300 ease-in-out top-1/2 -translate-y-1/2 ${
									isMenuOpen ? 'w-0 opacity-0' : 'w-full opacity-100'
								}`}
							></span>
							<span
								className={`absolute block h-0.5 w-full bg-gray-700 rounded-full transform transition-all duration-300 ease-in-out ${
									isMenuOpen
										? '-rotate-45 top-1/2 -translate-y-1/2 bg-blue-600'
										: 'bottom-0'
								}`}
							></span>
						</div>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`lg:hidden mobile-menu transition-all duration-300 ease-in-out pointer-events-auto ${
					isMenuOpen
						? 'max-h-screen opacity-100'
						: 'max-h-0 opacity-0 overflow-hidden'
				}`}
			>
				<div className='bg-white border-t border-gray-200'>
					<div className='container mx-auto px-4 py-4 space-y-2'>
						<div className='pb-4 mb-4 border-b border-gray-100 flex items-center'>
							<SearchSection />
						</div>

						<div className='flex flex-row pb-4 mb-4 border-b border-gray-100 gap-6'>
							<LanguageSwitcher />
							<Link
								href={`/${currentLang}/properties?3d=true`}
								className='flex items-center gap-1 text-gray-700 font-medium'
								onClick={() => setIsMenuOpen(false)}
							>
								<FaVrCardboard className='w-4 h-4' />
								<span>{t.dTour}</span>
							</Link>
						</div>

						{navItems.map(item => (
							<div key={item.label} className='space-y-2'>
								{item.dropdown ? (
									<button
										className={`w-full text-left px-4 py-3 rounded-lg font-medium flex justify-between items-center
              ${getNavItemClass(item.href)}`}
										onClick={() =>
											setOpenDropdown(
												openDropdown === item.label ? null : item.label
											)
										}
									>
										<span>{item.label}</span>
										<span
											className={`transition-transform ${
												openDropdown === item.label ? 'rotate-180' : ''
											}`}
										>
											▾
										</span>
									</button>
								) : (
									// ✅ Use Link instead of button for top-level non-dropdown links
									<Link
										href={item.href}
										className={`block px-4 py-3 rounded-lg font-medium ${getNavItemClass(
											item.href
										)}`}
										onClick={() => setIsMenuOpen(false)}
									>
										{item.label}
									</Link>
								)}

								{/* Mobile Dropdown */}
								{item.dropdown && openDropdown === item.label && (
									<div className='ml-4 space-y-1'>
										{item.dropdown.map(sub => (
											<Link
												key={sub.label}
												href={sub.href}
												className='block px-4 py-2 text-sm rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50'
												onClick={() => {
													setIsMenuOpen(false)
													setOpenDropdown(null)
												}}
											>
												{sub.label}
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
