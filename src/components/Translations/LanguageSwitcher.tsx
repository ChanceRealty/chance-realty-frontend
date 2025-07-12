'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

export type Language = 'hy' | 'en' | 'ru'

const languages = [
	{ code: 'hy' as Language, flag: 'am' },
	{ code: 'en' as Language, flag: 'us' },
	{ code: 'ru' as Language, flag: 'ru' },
]

const getFlagUrl = (code: string) => `https://flagcdn.com/w40/${code}.png`

export default function LanguageSwitcher() {
	const router = useRouter()
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)

	const pathParts = pathname.split('/')
	const currentLang = (
		['hy', 'en', 'ru'].includes(pathParts[1]) ? pathParts[1] : 'hy'
	) as Language

	const currentLanguage =
		languages.find(lang => lang.code === currentLang) || languages[0]

	const switchLanguage = (newLang: Language) => {
		const pathParts = pathname.split('/')
		if (['hy', 'en', 'ru'].includes(pathParts[1])) {
			pathParts[1] = newLang
		} else {
			pathParts.splice(1, 0, newLang)
		}
		const newPath = pathParts.join('/')
		localStorage.setItem('preferred-language', newLang)
		router.push(newPath)
		setIsOpen(false)
	}

	return (
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700'
				aria-label='Change language'
			>
				<Image
					src={getFlagUrl(currentLanguage.flag)}
					alt={currentLang}
					width={40}
					height={30}
					className='w-6 h-4 rounded-sm object-cover'
				/>

				<ChevronDown
					className={`w-3 h-3 transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{isOpen && (
				<>
					<div
						className='fixed inset-0 z-40'
						onClick={() => setIsOpen(false)}
					/>

					<div className='absolute top-full left-0 mt-2 w-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50'>
						{languages.map(language => (
							<button
								key={language.code}
								onClick={() => switchLanguage(language.code)}
								className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors ${
									language.code === currentLang ? 'bg-blue-50' : ''
								}`}
							>
								<Image
									src={getFlagUrl(language.flag)}
									alt={language.code}
									width={40}
									height={30}
									className='w-6 h-4 rounded-sm object-cover'
								/>

								{language.code === currentLang && (
									<span className='text-blue-600 font-bold text-sm'>✓</span>
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}
