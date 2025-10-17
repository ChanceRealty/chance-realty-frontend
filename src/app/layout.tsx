// src/app/layout.tsx - Armenian as default language
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientLayout from './client-layout'
import {
	generateOrganizationSchema,
	generateWebsiteSchema,
} from '@/utils/structuredData'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
		default: 'Chance Realty - Գտեք ձեր երազանքի անշարժ գույքը Հայաստանում',
		template: '%s | Chance Realty',
	},
	description:
		'Բացահայտեք պրեմիում անշարժ գույք Հայաստանում։ Տներ, բնակարաններ, կոմերցիոն գույք և հողատարածքներ վաճառքի և վարձակալության համար։',
	keywords: [
		'անշարժ գույք Հայաստան',
		'ansharj guyq Hayastan',
		'ansharj guyq',
		'ansharj guyq Yerevan',
		'տներ վաճառք Երևան',
		'բնակարաններ վարձակալություն Հայաստան',
		'կոմերցիոն գույք Հայաստան',
		'հող վաճառք Հայաստան',
		'Chance Realty',
		'անշարժ գույք Երևան',
		'Հայաստանի անշարժ գույքի շուկա',
	],
	authors: [{ name: 'Chance Realty Թիմ' }],
	creator: 'Chance Realty',
	publisher: 'Chance Realty',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	icons: {
		icon: [
			{ url: '/favicon.ico' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
		],
		other: [
			{
				rel: 'android-chrome-192x192',
				url: '/android-chrome-192x192.png',
			},
			{
				rel: 'android-chrome-512x512',
				url: '/android-chrome-512x512.png',
			},
		],
	},
	manifest: '/site.webmanifest', // Default manifest (Armenian)
	openGraph: {
		type: 'website',
		locale: 'hy_AM',
		url: 'https://chancerealty.am',
		siteName: 'Chance Realty',
		title: 'Chance Realty - Գտեք ձեր երազանքի անշարժ գույքը Հայաստանում',
		description:
			'Բացահայտեք պրեմիում անշարժ գույք Հայաստանում։ Պրոֆեսիոնալ անշարժ գույքի ծառայություններ ստուգված ցուցակներով։',
		images: [
			{
				url: '/images/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Chance Realty - Անշարժ գույք Հայաստանում',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Chance Realty - Գտեք ձեր երազանքի անշարժ գույքը Հայաստանում',
		description:
			'Բացահայտեք պրեմիում անշարժ գույք Հայաստանում։ Պրոֆեսիոնալ անշարժ գույքի ծառայություններ։',
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
		canonical: 'https://chancerealty.am/hy',
		languages: {
			'hy-AM': 'https://chancerealty.am/hy',
			'en-US': 'https://chancerealty.am/en',
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

				{/* Language-specific manifests */}
				<link rel='manifest' href='/site.webmanifest' hrefLang='hy' />
				<link rel='manifest' href='/site-en.webmanifest' hrefLang='en' />
				<link rel='manifest' href='/site-ru.webmanifest' hrefLang='ru' />

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
				<ClientLayout>
					{children}
					<SpeedInsights />
				</ClientLayout>
			</body>
		</html>
	)
}
