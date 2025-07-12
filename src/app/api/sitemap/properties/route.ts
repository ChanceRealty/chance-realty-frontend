import { NextResponse } from 'next/server'
import { getProperties } from '@/services/propertyService'

interface PropertyImage {
  url: string
  title?: string
  caption?: string
}

interface Property {
  custom_id: string
  updated_at: string | Date
  featured?: boolean
  title: string
  images?: PropertyImage[]
}

export async function GET() {
  try {
    const properties: Property[] = await getProperties({ limit: 1000 })
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${properties.map((property: Property) => `
        <url>
          <loc>https://chancerealty.am/properties/${property.custom_id}</loc>
          <lastmod>${new Date(property.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${property.featured ? '0.9' : '0.6'}</priority>
          ${property.images?.map((image: PropertyImage) => `
            <image:image>
              <image:loc>${image.url}</image:loc>
              <image:title>${property.title}</image:title>
              <image:caption>${image.caption || property.title}</image:caption>
            </image:image>
          `).join('') || ''}
        </url>
      `).join('')}
    </urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating properties sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
