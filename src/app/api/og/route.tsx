import Image from 'next/image'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		const title = searchParams.get('title') || 'Chance Realty'
		const description =
			searchParams.get('description') || 'Find your dream property in Armenia'
		const price = searchParams.get('price')
		const propertyType = searchParams.get('type')
		const location = searchParams.get('location')
		const image = searchParams.get('image')

		return new ImageResponse(
			(
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#1e40af',
						backgroundImage: 'linear-gradient(45deg, #1e40af 0%, #3730a3 100%)',
						color: 'white',
						fontFamily: 'system-ui',
					}}
				>
					{/* Logo/Brand */}
					<div
						style={{
							position: 'absolute',
							top: 40,
							left: 40,
							fontSize: 24,
							fontWeight: 'bold',
							color: '#fbbf24',
						}}
					>
						Chance Realty
					</div>

					{/* Main Content */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							textAlign: 'center',
							padding: '0 80px',
							maxWidth: '80%',
						}}
					>
						{/* Property Image */}
						{image && (
							<Image
								src={image}
								alt='Property'
								style={{
									width: 400,
									height: 300,
									objectFit: 'cover',
									borderRadius: 16,
									marginBottom: 30,
									border: '4px solid white',
								}}
							/>
						)}

						{/* Title */}
						<h1
							style={{
								fontSize: image ? 36 : 48,
								fontWeight: 'bold',
								marginBottom: 20,
								lineHeight: 1.2,
							}}
						>
							{title}
						</h1>

						{/* Property Details */}
						<div
							style={{
								display: 'flex',
								gap: 30,
								marginBottom: 20,
								fontSize: 18,
							}}
						>
							{propertyType && (
								<div
									style={{
										backgroundColor: 'rgba(255,255,255,0.2)',
										padding: '8px 16px',
										borderRadius: 8,
									}}
								>
									{propertyType}
								</div>
							)}
							{location && (
								<div
									style={{
										backgroundColor: 'rgba(255,255,255,0.2)',
										padding: '8px 16px',
										borderRadius: 8,
									}}
								>
									📍 {location}
								</div>
							)}
						</div>

						{/* Price */}
						{price && (
							<div
								style={{
									fontSize: 32,
									fontWeight: 'bold',
									color: '#fbbf24',
									marginBottom: 20,
								}}
							>
								{price}
							</div>
						)}

						{/* Description */}
						{description && (
							<p
								style={{
									fontSize: 20,
									opacity: 0.9,
									textAlign: 'center',
									lineHeight: 1.4,
								}}
							>
								{description.length > 120
									? `${description.slice(0, 120)}...`
									: description}
							</p>
						)}
					</div>

					{/* Website URL */}
					<div
						style={{
							position: 'absolute',
							bottom: 40,
							right: 40,
							fontSize: 18,
							opacity: 0.8,
						}}
					>
						chancerealty.am
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		)
	} catch (e: unknown) {
		return new Response(`Failed to generate the image`, {
			status: 500,
		})
	}
}
