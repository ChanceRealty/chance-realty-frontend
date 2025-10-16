// src/app/api/currency/convert/route.ts - FINAL OPTIMIZED VERSION
import { NextResponse } from 'next/server'

// In-memory cache for exchange rates
const rateCache = new Map<string, { rate: number; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

function corsResponse(response: NextResponse) {
	response.headers.set('Access-Control-Allow-Origin', '*')
	response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
	return response
}

export async function OPTIONS() {
	return corsResponse(new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const amount = parseFloat(searchParams.get('amount') || '0')
		const fromCurrency = searchParams.get('from') || 'USD'
		const toCurrencies = searchParams.get('to')?.split(',') || ['RUB', 'AMD']

		if (amount <= 0) {
			return corsResponse(
				NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
			)
		}

		// Get exchange rates
		const rates = await getExchangeRates(fromCurrency, toCurrencies)

		// Convert amounts
		const conversions = toCurrencies.map(currency => {
			const rate = rates[currency] || 1
			const convertedAmount = amount * rate
			return {
				amount: convertedAmount,
				currency,
				formattedAmount: formatCurrency(convertedAmount, currency),
				rate,
			}
		})

		const response = NextResponse.json({
			success: true,
			original: {
				amount,
				currency: fromCurrency,
				formattedAmount: formatCurrency(amount, fromCurrency),
			},
			conversions,
			timestamp: Date.now(),
			cached: false,
		})

		return corsResponse(response)
	} catch (error) {
		console.error('💥 Currency conversion error:', error)
		const response = NextResponse.json(
			{ error: 'Failed to convert currency' },
			{ status: 500 }
		)
		return corsResponse(response)
	}
}

async function getExchangeRates(
	baseCurrency: string,
	targetCurrencies: string[]
): Promise<Record<string, number>> {
	const cacheKey = `${baseCurrency}-${targetCurrencies.join(',')}`
	const cached = rateCache.get(cacheKey)

	// Return cached rates if still valid
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		const rates: Record<string, number> = {}
		targetCurrencies.forEach(currency => {
			const currencyCache = rateCache.get(`${baseCurrency}-${currency}`)
			if (currencyCache) {
				rates[currency] = currencyCache.rate
			}
		})
		if (Object.keys(rates).length === targetCurrencies.length) {
			return rates
		}
	}


	try {
		// Primary: Fawaz API (best accuracy and reliability)
		let rates = await fetchFromFawazAPI(baseCurrency, targetCurrencies)

		if (!rates || Object.keys(rates).length === 0) {
			rates = await fetchFromExchangeRateAPI(baseCurrency, targetCurrencies)
		}

		if (!rates || Object.keys(rates).length === 0) {
			throw new Error('All currency APIs failed')
		}

		// Cache the rates
		const timestamp = Date.now()
		Object.entries(rates).forEach(([currency, rate]) => {
			rateCache.set(`${baseCurrency}-${currency}`, { rate, timestamp })
		})

		return rates
	} catch (error) {
		console.error('💥 All APIs failed:', error)
		return getCurrentFallbackRates(targetCurrencies)
	}
}

// Primary API: Fawaz's Currency API (GitHub CDN-hosted, most reliable)
async function fetchFromFawazAPI(
	baseCurrency: string,
	targetCurrencies: string[]
): Promise<Record<string, number>> {
	try {
		const baseCode = baseCurrency.toLowerCase()
		const response = await fetch(
			`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCode}.json`,
			{
				headers: {
					Accept: 'application/json',
				},
				// Add cache control for better performance
				next: { revalidate: 1800 }, // 30 minutes
			}
		)

		if (!response.ok) {
			throw new Error(`Fawaz API error: ${response.status}`)
		}

		const data = await response.json()
		const baseCurrencyRates = data[baseCode]

		if (!baseCurrencyRates) {
			throw new Error('No rates found in Fawaz API response')
		}

		// Filter only requested currencies
		const filteredRates: Record<string, number> = {}
		targetCurrencies.forEach(currency => {
			const rate = baseCurrencyRates[currency.toLowerCase()]
			if (rate) {
				filteredRates[currency] = rate
			}
		})

		return filteredRates
	} catch (error) {
		console.error('❌ Fawaz API failed:', error)
		throw error
	}
}

// Backup API: ExchangeRate-API
async function fetchFromExchangeRateAPI(
	baseCurrency: string,
	targetCurrencies: string[]
): Promise<Record<string, number>> {
	try {
		const response = await fetch(
			`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
			{
				headers: {
					Accept: 'application/json',
				},
				next: { revalidate: 1800 }, // 30 minutes
			}
		)

		if (!response.ok) {
			throw new Error(`ExchangeRate-API error: ${response.status}`)
		}

		const data = await response.json()

		if (!data.rates) {
			throw new Error('No rates found in ExchangeRate-API response')
		}

		// Filter only requested currencies
		const filteredRates: Record<string, number> = {}
		targetCurrencies.forEach(currency => {
			if (data.rates[currency]) {
				filteredRates[currency] = data.rates[currency]
			}
		})

		return filteredRates
	} catch (error) {
		console.error('❌ ExchangeRate-API failed:', error)
		throw error
	}
}

// Updated fallback rates based on your test results
function getCurrentFallbackRates(
	targetCurrencies: string[]
): Record<string, number> {

	// Use average of both APIs from your test for maximum accuracy
	const fallbackRates: Record<string, number> = {
		RUB: 79.76, // Average of 79.82 (Fawaz) and 79.69 (ExchangeRate-API)
		AMD: 383.33, // Average of 383.22 (Fawaz) and 383.44 (ExchangeRate-API)
		EUR: 0.867, // Current USD to EUR
		GBP: 0.738, // Current USD to GBP
	}

	const result: Record<string, number> = {}
	targetCurrencies.forEach(currency => {
		if (fallbackRates[currency]) {
			result[currency] = fallbackRates[currency]
		}
	})

	return result
}

function formatCurrency(amount: number, currency: string): string {
	const currencyConfig: Record<
		string,
		{ locale: string; options: Intl.NumberFormatOptions }
	> = {
		USD: {
			locale: 'en-US',
			options: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
		},
		RUB: {
			locale: 'ru-RU',
			options: { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 },
		},
		AMD: {
			locale: 'hy-AM',
			options: { style: 'currency', currency: 'AMD', maximumFractionDigits: 0 },
		},
	}

	const config = currencyConfig[currency] || currencyConfig['USD']

	try {
		return new Intl.NumberFormat(config.locale, config.options).format(amount)
	} catch {
		// Fallback formatting if Intl fails
		const symbols: Record<string, string> = {
			USD: '$',
			RUB: '₽',
			AMD: '֏',
		}
		const symbol = symbols[currency] || currency
		return `${symbol}${amount.toLocaleString()}`
	}
}
