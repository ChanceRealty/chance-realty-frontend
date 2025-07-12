// src/hooks/useCurrencyConversion.ts - FIXED
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

interface ConversionResult {
	amount: number
	currency: string
	formattedAmount: string
	rate?: number
}

interface CurrencyConversionData {
	original: ConversionResult
	conversions: ConversionResult[]
	timestamp: number
	loading: boolean
	error: string | null
}

interface UseCurrencyConversionOptions {
	autoFetch?: boolean
	refreshInterval?: number // in milliseconds
	targetCurrencies?: string[]
}

export function useCurrencyConversion(
	amount: number,
	fromCurrency = 'USD',
	options: UseCurrencyConversionOptions = {}
) {
	const memoizedOptions = useMemo(
		() => ({
			autoFetch: true,
			refreshInterval: 30 * 60 * 1000,
			targetCurrencies: ['RUB', 'AMD'],
			...options,
		}),
		[
			options.autoFetch,
			options.refreshInterval,
			JSON.stringify(options.targetCurrencies),
		]
	)

	const { autoFetch, refreshInterval, targetCurrencies } = memoizedOptions

	const [data, setData] = useState<CurrencyConversionData>(() => ({
		original: {
			amount,
			currency: fromCurrency,
			formattedAmount: formatCurrency(amount, fromCurrency),
		},
		conversions: targetCurrencies.map(currency => ({
			amount,
			currency,
			formattedAmount: formatCurrency(amount, currency),
		})),
		timestamp: Date.now(),
		loading: false,
		error: null,
	}))

	// ✅ FIX: Use ref to track if we're currently fetching to prevent multiple requests
	const isFetchingRef = useRef(false)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	// ✅ FIX: Memoize the convertCurrency function
	const convertCurrency = useCallback(
		async (convertAmount?: number, convertFromCurrency?: string) => {
			const finalAmount = convertAmount ?? amount
			const finalFromCurrency = convertFromCurrency ?? fromCurrency

			if (finalAmount <= 0) {
				setData(prev => ({
					...prev,
					error: 'Invalid amount',
				}))
				return
			}

			// Prevent multiple simultaneous requests
			if (isFetchingRef.current) {
				return
			}

			isFetchingRef.current = true
			setData(prev => ({ ...prev, loading: true, error: null }))

			try {
				const response = await fetch(
					`/api/currency/convert?amount=${finalAmount}&from=${finalFromCurrency}&to=${targetCurrencies.join(
						','
					)}`
				)

				if (!response.ok) {
					throw new Error(`Failed to convert currency: ${response.status}`)
				}

				const result = await response.json()

				if (!result.success) {
					throw new Error(result.error || 'Currency conversion failed')
				}

				setData({
					original: result.original,
					conversions: result.conversions,
					timestamp: result.timestamp,
					loading: false,
					error: null,
				})
			} catch (error) {
				console.error('Currency conversion error:', error)
				setData(prev => ({
					...prev,
					loading: false,
					error:
						error instanceof Error ? error.message : 'Unknown error occurred',
				}))
			} finally {
				isFetchingRef.current = false
			}
		},
		[amount, fromCurrency, targetCurrencies] // ✅ FIX: Only depend on primitive values
	)

	// ✅ FIX: Auto-fetch effect with proper dependency control
	useEffect(() => {
		if (autoFetch && amount > 0 && !isFetchingRef.current) {
			convertCurrency()
		}
	}, [autoFetch, amount, fromCurrency, convertCurrency])

	// ✅ FIX: Auto-refresh effect with cleanup
	useEffect(() => {
		if (!refreshInterval || refreshInterval <= 0) return

		// Clear existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}

		intervalRef.current = setInterval(() => {
			if (amount > 0 && !isFetchingRef.current) {
				convertCurrency()
			}
		}, refreshInterval)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, [refreshInterval, convertCurrency])

	// ✅ FIX: Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
			isFetchingRef.current = false
		}
	}, [])

	// Manual refresh function
	const refresh = useCallback(() => {
		if (!isFetchingRef.current) {
			convertCurrency()
		}
	}, [convertCurrency])

	// Format currency helper
	const formatCurrencyValue = useCallback((value: number, currency: string) => {
		return formatCurrency(value, currency)
	}, [])

	// Get currency symbol
	const getCurrencySymbol = useCallback((currency: string) => {
		const symbols: Record<string, string> = {
			USD: '$',
			RUB: '₽',
			AMD: '֏',
		}
		return symbols[currency] || currency
	}, [])

	// ✅ FIX: Memoize return object to prevent unnecessary re-renders
	return useMemo(
		() => ({
			...data,
			convertCurrency,
			refresh,
			formatCurrency: formatCurrencyValue,
			getCurrencySymbol,
			// Helper getters
			usdAmount: data.original,
			rubAmount: data.conversions.find(c => c.currency === 'RUB'),
			amdAmount: data.conversions.find(c => c.currency === 'AMD'),
			isStale: Date.now() - data.timestamp > refreshInterval,
		}),
		[
			data,
			convertCurrency,
			refresh,
			formatCurrencyValue,
			getCurrencySymbol,
			refreshInterval,
		]
	)
}

// Standalone currency formatting function
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

// Export the formatting function for standalone use
export { formatCurrency }
