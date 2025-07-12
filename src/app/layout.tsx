// src/app/layout.tsx - Updated to handle locale properly
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientLayout from './client-layout'
import {
	generateOrganizationSchema,
	generateWebsiteSchema,
} from '@/utils/structuredData'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
})

export const metadata: Metadata = {
	metadataBase: new URL('https://chancerealty.am'),
	title: {
		default: 'Chance Realty - Find Your Dream Property in Armenia',
		template: '%s | Chance Realty',
	},
	description:
		'Discover premium real estate in Armenia. Houses, apartments, commercial properties, and land for sale or rent. Professional real estate services in Yerevan and surrounding areas.',
	keywords: [
		'real estate Armenia',
		'property Armenia',
		'houses for sale Yerevan',
		'apartments for rent Armenia',
		'commercial property Armenia',
		'land for sale Armenia',
		'Chance Realty',
		'Armenian real estate',
		'Yerevan property market',
	],
	authors: [{ name: 'Chance Realty Team' }],
	creator: 'Chance Realty',
	publisher: 'Chance Realty',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://chancerealty.am',
		siteName: 'Chance Realty',
		title: 'Chance Realty - Find Your Dream Property in Armenia',
		description:
			'Discover premium real estate in Armenia. Professional real estate services with verified listings.',
		images: [
			{
				url: '/images/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Chance Realty - Real Estate in Armenia',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Chance Realty - Find Your Dream Property in Armenia',
		description:
			'Discover premium real estate in Armenia. Professional real estate services with verified listings.',
		images: ['/images/og-image.jpg'],
		creator: '@ChanceRealty',
		site: '@ChanceRealty',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	verification: {
		google: 'your-google-verification-code',
		yandex: 'your-yandex-verification-code',
	},
	alternates: {
		canonical: 'https://chancerealty.am',
		languages: {
			'en-US': 'https://chancerealty.am/en',
			'hy-AM': 'https://chancerealty.am/hy',
			'ru-RU': 'https://chancerealty.am/ru',
		},
	},
	other: {
		'msapplication-TileColor': '#2563eb',
		'theme-color': '#2563eb',
	},
}



export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const organizationSchema = generateOrganizationSchema()
	const websiteSchema = generateWebsiteSchema()

	// Note: In a server component, we can't access window.location
	// The locale will be handled by middleware and the [locale] layout
	const defaultLocale = 'hy'

	return (
		<html lang={defaultLocale}>
			<head>
				{/* Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationSchema),
					}}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>

				{/* Preconnect to improve performance */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin=''
				/>

				{/* DNS Prefetch for external domains */}
				<link rel='dns-prefetch' href='//maps.googleapis.com' />
				<link rel='dns-prefetch' href='//www.google-analytics.com' />

				{/* Favicon and app icons */}
				<link rel='icon' href='/favicon.ico' sizes='any' />
				<link rel='icon' href='/icon.svg' type='image/svg+xml' />
				<link rel='apple-touch-icon' href='/apple-touch-icon.png' />
				<link rel='manifest' href='/manifest.json' />

				{/* Language alternates */}
				<link rel='alternate' hrefLang='hy' href='https://chancerealty.am/hy' />
				<link rel='alternate' hrefLang='en' href='https://chancerealty.am/en' />
				<link rel='alternate' hrefLang='ru' href='https://chancerealty.am/ru' />
				<link
					rel='alternate'
					hrefLang='x-default'
					href='https://chancerealty.am/hy'
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	)
}
