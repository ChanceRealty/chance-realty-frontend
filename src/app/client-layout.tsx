// src/app/client-layout.tsx - Updated to handle locale properly
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './_components/Header'
import Footer from './_components/Footer'
import { LanguageProvider } from '@/context/LanguageContext'

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	// Update document language based on current locale
	useEffect(() => {
		const segments = pathname.split('/')
		const locale = segments[1]

		if (['hy', 'en', 'ru'].includes(locale)) {
			document.documentElement.lang = locale
		}
	}, [pathname])

	return (
		<LanguageProvider>
			<Header />
			<main>{children}</main>
			<Footer />
		</LanguageProvider>
	)
}
