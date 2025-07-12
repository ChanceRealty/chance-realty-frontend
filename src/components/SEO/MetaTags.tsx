'use client'

import { useEffect } from 'react'

interface MetaTagsProps {
	title?: string
	description?: string
	keywords?: string
	image?: string
	url?: string
	type?: string
	noindex?: boolean
}

export default function MetaTags({
	title,
	description,
	keywords,
	image,
	url,
	type = 'website',
	noindex = false,
}: MetaTagsProps) {
	useEffect(() => {
		// Update document title
		if (title) {
			document.title = title
		}

		// Update meta tags
		const updateMeta = (name: string, content: string) => {
			let meta = document.querySelector(
				`meta[name="${name}"]`
			) as HTMLMetaElement
			if (!meta) {
				meta = document.createElement('meta')
				meta.name = name
				document.head.appendChild(meta)
			}
			meta.content = content
		}

		const updateProperty = (property: string, content: string) => {
			let meta = document.querySelector(
				`meta[property="${property}"]`
			) as HTMLMetaElement
			if (!meta) {
				meta = document.createElement('meta')
				meta.setAttribute('property', property)
				document.head.appendChild(meta)
			}
			meta.content = content
		}

		if (description) updateMeta('description', description)
		if (keywords) updateMeta('keywords', keywords)
		if (noindex) updateMeta('robots', 'noindex,nofollow')

		if (title) updateProperty('og:title', title)
		if (description) updateProperty('og:description', description)
		if (image) updateProperty('og:image', image)
		if (url) updateProperty('og:url', url)
		if (type) updateProperty('og:type', type)
	}, [title, description, keywords, image, url, type, noindex])

	return null
}
