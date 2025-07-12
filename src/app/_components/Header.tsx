'use client'

import LanguageSwitcher from '@/components/Translations/LanguageSwitcher'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
	const pathname = usePathname()

	const pathParts = pathname.split('/')
	const currentLang = (
		['hy', 'en', 'ru'].includes(pathParts[1]) ? pathParts[1] : 'hy'
	) as 'hy' | 'en' | 'ru'

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

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
			login: 'Մուտք',
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
			login: 'Login',
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
			login: 'Вход',
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
		if (isScrolled) {
			return isActive
				? 'text-blue-600 bg-blue-50'
				: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
		} else {
			return isActive
				? 'text-white'
				: 'text-white hover:text-blue-400 hover:bg-white/10'
		}
	}

	const getMobileNavItemClass = (href: string) => {
		const isActive = pathname.startsWith(href)
		return isActive
			? 'text-blue-600 bg-blue-50'
			: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
	}

	return (
		<header
			className={`sticky top-0 z-50 transition-all duration-300 ${
				isScrolled
					? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100'
					: 'bg-[#1B3B6F] shadow-sm'
			}`}
		>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between h-20'>
					<Link
						href={`/${currentLang}`}
						className='flex items-center group relative'
					>
						<div className='relative overflow-hidden rounded-xl'>
							<Image
								src='/2.png'
								alt='Chance Realty Logo'
								width={280}
								height={160}
								className={`h-37 w-37 transition-all duration-500 group-hover:scale-105 ${
									isScrolled
										? 'opacity-0 transform scale-95'
										: 'opacity-100 transform scale-100'
								}`}
								priority
								style={{
									position: isScrolled ? 'absolute' : 'relative',
									top: isScrolled ? '0' : 'auto',
									left: isScrolled ? '0' : 'auto',
								}}
							/>
							<Image
								src='/3.png'
								alt='Chance Realty Logo Compact'
								width={200}
								height={120}
								className={`h-37 w-37 transition-all duration-500 group-hover:scale-105 ${
									isScrolled
										? 'opacity-100 transform scale-100'
										: 'opacity-0 transform scale-95'
								}`}
								style={{
									position: isScrolled ? 'relative' : 'absolute',
									top: isScrolled ? 'auto' : '0',
									left: isScrolled ? 'auto' : '0',
								}}
							/>
						</div>
					</Link>

					<nav className='hidden lg:flex items-center space-x-1'>
						{navItems.map(item => {
							return (
								<div
									key={item.label}
									className='relative group'
									onMouseEnter={() => setActiveDropdown(item.label)}
									onMouseLeave={() => setActiveDropdown(null)}
								>
									<Link
										href={item.href}
										className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${getNavItemClass(
											item.href
										)}`}
									>
										{item.label}
										{item.dropdown && (
											<ChevronDown
												className={`ml-1 w-4 h-4 transition-transform duration-200 ${
													activeDropdown === item.label ? 'rotate-180' : ''
												}`}
											/>
										)}
										<span
											className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 ${
												isScrolled ? 'bg-blue-600' : 'bg-blue-600'
											} transition-all duration-300 group-hover:w-full`}
										></span>
									</Link>

									{item.dropdown && (
										<div
											className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
												activeDropdown === item.label
													? 'opacity-100 visible translate-y-0'
													: 'opacity-0 invisible -translate-y-2'
											}`}
										>
											<div className='p-2'>
												{item.dropdown.map((dropdownItem, dropdownIndex) => (
													<Link
														key={dropdownItem.label}
														href={dropdownItem.href}
														className='block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-200 text-sm font-medium'
														style={{
															animationDelay: `${dropdownIndex * 50}ms`,
														}}
													>
														{dropdownItem.label}
													</Link>
												))}
											</div>
										</div>
									)}
								</div>
							)
						})}
					</nav>

					<div className='hidden lg:flex items-center space-x-2'>
						<LanguageSwitcher />
					</div>

					{/* Mobile Menu Button */}
					<button
						className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${
							isScrolled
								? 'text-gray-700 hover:bg-gray-100'
								: 'text-white hover:bg-white/10'
						}`}
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label='Toggle mobile menu'
					>
						<div className='relative w-6 h-6'>
							<span
								className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${
									isScrolled ? 'bg-gray-700' : 'bg-white'
								} ${
									isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'
								}`}
							></span>
							<span
								className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${
									isScrolled ? 'bg-gray-700' : 'bg-white'
								} ${isMenuOpen ? 'opacity-0' : 'translate-y-0'}`}
							></span>
							<span
								className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${
									isScrolled ? 'bg-gray-700' : 'bg-white'
								} ${
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
				<div className='bg-white border-t border-gray-100 shadow-2xl'>
					<div className='container mx-auto px-4 py-6 space-y-2'>
						<div className='pb-4 mb-4 border-b border-gray-100 flex justify-start'>
							<LanguageSwitcher />
						</div>
						{navItems.map((item, index) => {
							return (
								<div key={item.label} className='space-y-2'>
									<Link
										href={item.href}
										className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${getMobileNavItemClass(
											item.href
										)}`}
										onClick={() => setIsMenuOpen(false)}
										style={{ animationDelay: `${index * 100}ms` }}
									>
										{item.label}
									</Link>

									{item.dropdown && (
										<div className='ml-4 space-y-1'>
											{item.dropdown.map((dropdownItem, dropdownIndex) => {
												const isSubActive = pathname.startsWith(
													dropdownItem.href
												)
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
														style={{
															animationDelay: `${
																index * 100 + dropdownIndex * 50
															}ms`,
														}}
													>
														{dropdownItem.label}
													</Link>
												)
											})}
										</div>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
