'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	RotateCcw,
	Loader2,
	Maximize,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'
import { getAdVideos } from '@/services/propertyService'

interface AdVideo {
	id: number
	file_id: string
	url: string
	created_at: string
}

export default function AdsPage() {
	const [adVideos, setAdVideos] = useState<AdVideo[]>([])
	const [loadingVideos, setLoadingVideos] = useState(true)
	const [isPlaying, setIsPlaying] = useState<boolean[]>([])
	const [isMuted, setIsMuted] = useState<boolean[]>([])
	const [progress, setProgress] = useState<number[]>([])
	const [showControls, setShowControls] = useState<boolean[]>([])
	const videoRefs = useRef<React.RefObject<HTMLVideoElement>[]>([])
	const progressIntervals = useRef<(NodeJS.Timeout | null)[]>([])
	const t = useTranslations()

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const data = await getAdVideos()
				setAdVideos(data)
				setIsPlaying(data.map(() => false))
				setIsMuted(data.map(() => true))
				setProgress(data.map(() => 0))
				setShowControls(data.map(() => false))
				videoRefs.current = data.map(
					(_, i) => videoRefs.current[i] || React.createRef(),
				)
				progressIntervals.current = data.map(() => null)
			} catch (error) {
				console.error('Error fetching ad videos:', error)
			} finally {
				setLoadingVideos(false)
			}
		}

		fetchVideos()
	}, [])

	useEffect(() => {
		return () => {
			progressIntervals.current.forEach(
				interval => interval && clearInterval(interval),
			)
		}
	}, [])

	const togglePlay = (index: number) => {
		const video = videoRefs.current[index]?.current
		if (!video) return

		if (isPlaying[index]) {
			video.pause()
			clearInterval(progressIntervals.current[index]!)
		} else {
			video.play()
			progressIntervals.current[index] = setInterval(() => {
				setProgress(prev => {
					const newProgress = [...prev]
					newProgress[index] = (video.currentTime / video.duration) * 100
					return newProgress
				})
			}, 100)
		}

		setIsPlaying(prev => {
			const newPlaying = [...prev]
			newPlaying[index] = !newPlaying[index]
			return newPlaying
		})
	}

	const toggleMute = (index: number) => {
		const video = videoRefs.current[index]?.current
		if (!video) return
		video.muted = !video.muted
		setIsMuted(prev => {
			const newMuted = [...prev]
			newMuted[index] = !newMuted[index]
			return newMuted
		})
	}

	const restartVideo = (index: number) => {
		const video = videoRefs.current[index]?.current
		if (!video) return
		video.currentTime = 0
		setProgress(prev => {
			const newProgress = [...prev]
			newProgress[index] = 0
			return newProgress
		})
	}

	const handleVideoEnd = (index: number) => {
		setIsPlaying(prev => {
			const newPlaying = [...prev]
			newPlaying[index] = false
			return newPlaying
		})
		if (progressIntervals.current[index])
			clearInterval(progressIntervals.current[index]!)
	}

	const toggleFullscreen = (index: number) => {
		const video = videoRefs.current[index]?.current
		if (!video) return

		if (!document.fullscreenElement) {
			video.requestFullscreen()
		} else {
			document.exitFullscreen()
		}
	}

	return (
		<div className='min-h-screen bg-white text-white'>
			{/* Header */}
			<header className='bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 text-center'>
				<h1 className='text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg'>
					{t.adsTitle}
				</h1>
				<p className='text-lg md:text-2xl opacity-90 drop-shadow-md'>
					{t.adsSubtitle}
				</p>
			</header>

			{/* Ads Grid */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
				{loadingVideos ? (
					<div className='flex items-center justify-center min-h-64'>
						<Loader2 className='w-10 h-10 text-blue-600 animate-spin' />
					</div>
				) : adVideos.length === 0 ? (
					<div className='text-center text-gray-500 py-20'>
						<p className='text-xl'>Տեսանյութեր չկան</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10'>
						{adVideos.map((video, index) => (
							<div
								key={video.id}
								className='relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300'
								onMouseEnter={() =>
									setShowControls(prev => {
										const n = [...prev]
										n[index] = true
										return n
									})
								}
								onMouseLeave={() =>
									setShowControls(prev => {
										const n = [...prev]
										n[index] = false
										return n
									})
								}
							>
								{/* Video */}
								<video
									ref={videoRefs.current[index]}
									className='w-full h-[500px] md:h-[600px] object-cover cursor-pointer'
									muted={isMuted[index]}
									playsInline
									onClick={() => togglePlay(index)}
									onEnded={() => handleVideoEnd(index)}
								>
									<source src={video.url} type='video/mp4' />
								</video>

								{/* Gradient Overlay */}
								<div
									className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300 ${
										isPlaying[index] ? 'opacity-0' : 'opacity-20'
									}`}
								/>

								{/* Controls */}
								{(showControls[index] || !isPlaying[index]) && (
									<div className='absolute bottom-3 md:bottom-6 left-0 right-0 flex justify-center gap-3 z-20'>
										{[
											{
												icon: isPlaying[index] ? (
													<Pause className='w-5 h-5 text-white' />
												) : (
													<Play className='w-5 h-5 text-white' />
												),
												onClick: () => togglePlay(index),
											},
											{
												icon: isMuted[index] ? (
													<VolumeX className='w-5 h-5 text-white' />
												) : (
													<Volume2 className='w-5 h-5 text-white' />
												),
												onClick: () => toggleMute(index),
											},
											{
												icon: <RotateCcw className='w-5 h-5 text-white' />,
												onClick: () => restartVideo(index),
											},
											{
												icon: <Maximize className='w-5 h-5 text-white' />,
												onClick: () => toggleFullscreen(index),
											},
										].map((btn, i) => (
											<button
												key={i}
												onClick={e => {
													e.stopPropagation()
													btn.onClick()
												}}
												className='w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-all'
											>
												{btn.icon}
											</button>
										))}
									</div>
								)}

								{/* Progress Bar */}
								<div className='absolute bottom-16 md:bottom-20 left-3 md:left-6 right-3 md:right-6 z-20'>
									<div className='w-full bg-white/20 rounded-full h-1 overflow-hidden backdrop-blur-sm'>
										<div
											className='h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100'
											style={{ width: `${progress[index]}%` }}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
