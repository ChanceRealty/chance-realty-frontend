'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/utils/structuredData'

interface BreadcrumbItem {
	name: string
	url: string
	current?: boolean
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[]
	className?: string
}

export default function Breadcrumbs({
	items,
	className = '',
}: BreadcrumbsProps) {
	const allItems = [{ name: 'Home', url: 'https://chancerealty.am' }, ...items]

	const structuredData = generateBreadcrumbSchema(allItems)

	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			<nav
				className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
				aria-label='Breadcrumb'
			>
				<Link
					href='/'
					className='flex items-center hover:text-blue-600 transition-colors'
				>
					<Home className='w-4 h-4' />
					<span className='sr-only'>Home</span>
				</Link>

				{items.map((item) => (
					<div key={item.url} className='flex items-center'>
						<ChevronRight className='w-4 h-4 mx-2 text-gray-400' />
						{item.current ? (
							<span className='font-medium text-gray-900' aria-current='page'>
								{item.name}
							</span>
						) : (
							<Link
								href={item.url}
								className='hover:text-blue-600 transition-colors'
							>
								{item.name}
							</Link>
						)}
					</div>
				))}
			</nav>
		</>
	)
}
