// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['hy', 'en', 'ru']
const defaultLocale = 'hy'

function getLocale(request: NextRequest): string {
	// Check URL for existing locale
	const pathname = request.nextUrl.pathname
	const pathnameLocale = locales.find(
		locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	)

	if (pathnameLocale) return pathnameLocale

	// Check cookie
	const cookieLocale = request.cookies.get('preferred-language')?.value
	if (cookieLocale && locales.includes(cookieLocale)) {
		return cookieLocale
	}

	// Check Accept-Language header
	const acceptLanguage = request.headers.get('accept-language')
	if (acceptLanguage) {
		// First check for Armenian
		if (acceptLanguage.includes('hy') || acceptLanguage.includes('am'))
			return 'hy'
		// Then Russian
		if (acceptLanguage.includes('ru')) return 'ru'
		// Finally English
		if (acceptLanguage.includes('en')) return 'en'
	}

	return defaultLocale
}

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	// Skip for API routes, static files, and internal Next.js routes
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon') ||
		pathname.includes('.') ||
		pathname.startsWith('/images')
	) {
		return NextResponse.next()
	}

	// Check if pathname already has a locale
	const pathnameIsMissingLocale = locales.every(
		locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
	)

	// Redirect if locale is missing
	if (pathnameIsMissingLocale) {
		const locale = getLocale(request)
		const newUrl = new URL(`/${locale}${pathname}`, request.url)

		const response = NextResponse.redirect(newUrl)

		// Set language cookie
		response.cookies.set('preferred-language', locale, {
			maxAge: 365 * 24 * 60 * 60, // 1 year
			httpOnly: false, // Allow client-side access
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})

		return response
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		// Skip internal Next.js routes and API routes
		'/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
	],
}
