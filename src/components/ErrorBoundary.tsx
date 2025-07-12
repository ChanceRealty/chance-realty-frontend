// src/components/ErrorBoundary.tsx - Error boundary with translations
'use client'

import React from 'react'
import { useTranslations } from '@/translations/translations' 

interface ErrorBoundaryState {
	hasError: boolean
	error?: Error
}

class ErrorBoundary extends React.Component<
	React.PropsWithChildren,
	ErrorBoundaryState
> {
	constructor(props: React.PropsWithChildren) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Error caught by boundary:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return <ErrorFallback error={this.state.error} />
		}

		return this.props.children
	}
}

function ErrorFallback({ error }: { error?: Error }) {
	const t = useTranslations()

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
				<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
					<span className='text-2xl'>⚠️</span>
				</div>

				<h1 className='text-2xl font-bold text-gray-900 mb-4'>{t.error}</h1>

				<p className='text-gray-600 mb-6'>
					Something went wrong. Please try refreshing the page or contact
					support if the problem persists.
				</p>

				<div className='space-y-3'>
					<button
						onClick={() => window.location.reload()}
						className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
					>
						Refresh Page
					</button>

					<button
						onClick={() => window.history.back()}
						className='w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'
					>
						{t.back}
					</button>
				</div>

				{error && process.env.NODE_ENV === 'development' && (
					<details className='mt-4 text-left'>
						<summary className='cursor-pointer text-sm text-gray-500'>
							Error Details (Development)
						</summary>
						<pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
							{error.stack}
						</pre>
					</details>
				)}
			</div>
		</div>
	)
}

export default ErrorBoundary
