'use client'

import { generateLocalBusinessSchema } from '@/utils/structuredData'

export default function LocalBusinessSEO() {
	const localBusinessSchema = generateLocalBusinessSchema()

	return (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(localBusinessSchema),
			}}
		/>
	)
}
