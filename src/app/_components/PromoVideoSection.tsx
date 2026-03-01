import { useState, useRef, useEffect } from 'react'
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	RotateCcw,
	Clapperboard,
	ArrowRight,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'
import Link from 'next/link'
import { getAdVideos } from '@/services/propertyService'

const PromoVideoSection = ({ language = 'hy' }) => {
	const [isPlaying, setIsPlaying] = useState([false])
	const [isMuted, setIsMuted] = useState([true])
	const [progress, setProgress] = useState([0])
	const [showControls, setShowControls] = useState([false])
	const [videoUrl, setVideoUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const videoRefs = [useRef(null)]
	const progressIntervals = useRef([null])
	const t = useTranslations()

	useEffect(() => {
		const fetchMainVideo = async () => {
			try {
				const data = await getAdVideos()

				const mainVideo = data.find(
					v => v.url === 'https://ik.imagekit.io/ky53movca/ad-videos/promo_zqkvEdX5t.mp4',
				)

				if (mainVideo) {
					setVideoUrl(mainVideo.url)
				}
			} catch (error) {
				console.error('Error fetching main promo video:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchMainVideo()
	}, [])

	useEffect(() => {
		videoRefs.forEach((ref, index) => {
			const video = ref.current
			if (video) {
				video.muted = true // обязательно для автоплея
				video.playsInline = true
				video.autoplay = true
				video.loop = true
				video
					.play()
					.then(() => {
						setIsPlaying(prev => {
							const newState = [...prev]
							newState[index] = true
							return newState
						})
						progressIntervals.current[index] = setInterval(() => {
							setProgress(prev => {
								const newProgress = [...prev]
								newProgress[index] = (video.currentTime / video.duration) * 100
								return newProgress
							})
						}, 100)
					})
			}
		})
	}, [])


	useEffect(() => {
		return () => {
			progressIntervals.current.forEach(
				interval => interval && clearInterval(interval)
			)
		}
	}, [])

	const togglePlay = index => {
		const video = videoRefs[index].current
		if (!video) return

		if (isPlaying[index]) {
			video.pause()
			clearInterval(progressIntervals.current[index])
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

	const toggleMute = index => {
		const video = videoRefs[index].current
		if (!video) return
		video.muted = !video.muted
		setIsMuted(prev => {
			const newMuted = [...prev]
			newMuted[index] = !newMuted[index]
			return newMuted
		})
	}

	const restartVideo = index => {
		const video = videoRefs[index].current
		if (!video) return
		video.currentTime = 0
		setProgress(prev => {
			const newProgress = [...prev]
			newProgress[index] = 0
			return newProgress
		})
	}

	const handleVideoEnd = index => {
		setIsPlaying(prev => {
			const newPlaying = [...prev]
			newPlaying[index] = false
			return newPlaying
		})
		if (progressIntervals.current[index])
			clearInterval(progressIntervals.current[index])
	}

	return (
		<section className='py-12 md:py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden'>
			{/* Animated Background */}
			<div className='absolute inset-0'>
				<div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20'></div>
				<div className='absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse'></div>
				<div className='absolute top-32 right-20 w-48 h-48 border border-white/5 rounded-full animate-pulse animation-delay-1000'></div>
				<div className='absolute bottom-20 left-32 w-24 h-24 border border-white/15 rounded-full animate-pulse animation-delay-2000'></div>
				<div className='absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-600/10 to-pink-600/10 rounded-full'></div>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
				{/* Video and Text Layout */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
					{/* Video Section - Left Side */}
					<div className='flex justify-center lg:justify-start lg:ml-24'>
						<div
							className='relative w-full max-w-[300px] md:max-w-[500px] lg:max-w-[300px] rounded-3xl overflow-hidden shadow-2xl'
							onMouseEnter={() => setShowControls([true])}
							onMouseLeave={() => setShowControls([false])}
						>
							<video
								ref={videoRefs[0]}
								className='w-full h-full object-cover cursor-pointer'
								muted={isMuted[0]}
								playsInline
								onClick={() => togglePlay(0)}
								onEnded={() => handleVideoEnd(0)}
							>
								{videoUrl && <source src={videoUrl} type='video/mp4' />}
							</video>

							<div
								className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300 ${
									isPlaying[0] ? 'opacity-0' : 'opacity-20'
								}`}
							/>

							{(showControls[0] || !isPlaying[0]) && (
								<div className='absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20'>
									{[
										{
											icon: isPlaying[0] ? (
												<Pause className='w-5 h-5 text-white' />
											) : (
												<Play className='w-5 h-5 text-white' />
											),
											onClick: () => togglePlay(0),
										},
										{
											icon: isMuted[0] ? (
												<VolumeX className='w-5 h-5 text-white' />
											) : (
												<Volume2 className='w-5 h-5 text-white' />
											),
											onClick: () => toggleMute(0),
										},
										{
											icon: <RotateCcw className='w-5 h-5 text-white' />,
											onClick: () => restartVideo(0),
										},
									].map((btn, i) => (
										<button
											key={i}
											onClick={e => {
												e.stopPropagation()
												btn.onClick()
											}}
											className='w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-all'
										>
											{btn.icon}
										</button>
									))}
								</div>
							)}
							<div className='absolute bottom-20 left-6 right-6 z-20'>
								<div className='w-full bg-white/20 rounded-full h-1 overflow-hidden backdrop-blur-sm'>
									<div
										className='h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100'
										style={{ width: `${progress[0]}%` }}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Text Content Section - Right Side */}
					<div className='text-center lg:text-left space-y-6'>
						{/* Subtitle */}
						<div className='inline-block'>
							<span className='px-3 py-1 text-xs sm:text-sm md:text-base bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-purple-200 font-semibold tracking-wide'>
								{t.adVideoSubtitle}
							</span>
						</div>

						{/* Main Title */}
						<h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight'>
							<span className='bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent'>
								{t.adVideoTitle}
							</span>
						</h2>

						{/* Description */}
						<p className='text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0'>
							{t.adVideoDescription}
						</p>

						{/* Call to Action Button */}
						<div className='pt-4'>
							<Link
								href={`/${language}/ads`}
								className='group inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base md:text-lg relative overflow-hidden'
							>
								<span className='absolute inset-0 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></span>
								<span className='relative z-10 flex items-center'>
									<span className='mr-2 sm:mr-3'>
										<Clapperboard />
									</span>
									{t.watchAllAds}
									<ArrowRight className='ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300' />
								</span>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes blob {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
					}
					25% {
						transform: translate(20px, -50px) scale(1.1);
					}
					50% {
						transform: translate(-20px, 20px) scale(0.9);
					}
					75% {
						transform: translate(50px, 50px) scale(1.05);
					}
				}
				.animate-blob {
					animation: blob 7s infinite;
				}
				.animation-delay-2000 {
					animation-delay: 2s;
				}
				.animation-delay-4000 {
					animation-delay: 4s;
				}
			`}</style>
		</section>
	)
}

export default PromoVideoSection
