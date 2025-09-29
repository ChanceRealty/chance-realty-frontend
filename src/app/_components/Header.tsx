'use client'

import LanguageSwitcher from '@/components/Translations/LanguageSwitcher'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import SearchSection from './SearchSection'

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const pathname = usePathname()

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
		{
			label: t.contact,
			href: `/${currentLang}/contact`,
		},
		{
			label: t.about,
			href: `/${currentLang}/about`,
		},
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
					{/* Logo */}
					<Link
						href={`/${currentLang}`}
						className='flex items-center group flex-shrink-0'
					>
						<div className='relative overflow-hidden rounded-xl'>
							<Image
								src='/cclogo2.png'
								alt='Chance Realty Logo'
								width={280}
								height={160}
								className='h-45 w-45 transition-all duration-500 group-hover:scale-105'
								priority
							/>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden lg:flex items-center space-x-1 flex-1 justify-center'>
						{navItems.map(item => (
							<div key={item.label} className='relative group'>
								<Link
									href={item.href}
									className={`relative px-3 xl:px-4 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 
	${getNavItemClass(item.href)} 
	after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
								>
									{item.label}
								</Link>
							</div>
						))}
					</nav>

					{/* Search & Language Switcher - Desktop */}
					<div className='hidden lg:flex items-center gap-3 flex-shrink-0'>
						<SearchSection />
						<LanguageSwitcher />
					</div>

					{/* Mobile Menu Button */}
					<button
						className='lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label='Toggle mobile menu'
					>
						<div className='relative w-6 h-6'>
							<span
								className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${
									isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'
								}`}
							></span>
							<span
								className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${
									isMenuOpen ? 'opacity-0' : 'translate-y-0'
								}`}
							></span>
							<span
								className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${
									isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'
								}`}
							></span>
						</div>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`lg:hidden mobile-menu transition-all duration-300 ease-in-out ${
					isMenuOpen
						? 'max-h-screen opacity-100'
						: 'max-h-0 opacity-0 overflow-hidden'
				}`}
			>
				<div className='bg-white border-t border-gray-200'>
					<div className='container mx-auto px-4 py-4 space-y-2'>
						{/* Mobile Search */}
						<div className='pb-4 mb-4 border-b border-gray-100'>
							<SearchSection />
						</div>

						{/* Mobile Language Switcher */}
						<div className='pb-4 mb-4 border-b border-gray-100'>
							<LanguageSwitcher />
						</div>

						{/* Mobile Nav Items */}
						{navItems.map((item) => (
							<div key={item.label} className='space-y-2'>
								<Link
									href={item.href}
									className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${getNavItemClass(
										item.href
									)}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.label}
								</Link>

								{item.dropdown && (
									<div className='ml-4 space-y-1'>
										{item.dropdown.map(dropdownItem => {
											const isSubActive = pathname.startsWith(dropdownItem.href)
											return (
												<Link
													key={dropdownItem.label}
													href={dropdownItem.href}
													className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
														isSubActive
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
													}`}
													onClick={() => setIsMenuOpen(false)}
												>
													{dropdownItem.label}
												</Link>
											)
										})}
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
