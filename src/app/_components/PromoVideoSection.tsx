import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react'

const PromoVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState([false, false])
  const [isMuted, setIsMuted] = useState([true, true])
  const [progress, setProgress] = useState([0, 0])
  const [showControls, setShowControls] = useState([false, false])
  const videoRefs = [useRef(null), useRef(null)]
  const progressIntervals = useRef([null, null])

  const videos = [
    {
      url: 'promo.mp4',
      title: 'Quick Tour',
      description: 'Experience our premium properties in 20 seconds',
      gradient: 'from-blue-600 via-purple-600 to-pink-600',
    },
  ]

  useEffect(() => {
    return () => {
      progressIntervals.current.forEach(interval => interval && clearInterval(interval))
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
    if (progressIntervals.current[index]) clearInterval(progressIntervals.current[index])
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
				{/* Header */}
				<div className='text-center mb-10 md:mb-16'>
					<div className='inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 md:mb-6 shadow-2xl animate-pulse'>
						<Play className='w-8 h-8 md:w-10 md:h-10 text-white ml-1' />
					</div>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-4'>
						Experience the
						<span className='block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mt-2'>
							Chance Realty Difference
						</span>
					</h2>
					<p className='text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4'>
						Watch our exclusive property showcases and discover why we&apos;re
						Armenia&apos;s premier real estate choice
					</p>
				</div>

				{/* Video Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto px-4 sm:px-0'>
					{videos.map((video, index) => (
						<div
							key={index}
							className='group relative mx-auto w-full flex justify-center items-center'
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
							<div className='bg-black rounded-2xl md:rounded-3xl overflow-hidden relative w-full max-w-[400px] aspect-[9/16] shadow-2xl'>
								{/* Video */}
								<video
									ref={videoRefs[index]}
									className='w-full h-full object-cover cursor-pointer'
									muted={isMuted[index]}
									playsInline
									onClick={() => togglePlay(index)}
									onEnded={() => handleVideoEnd(index)}
									poster={`/poster-${index + 1}.jpg`}
								>
									<source src={video.url} type='video/mp4' />
								</video>

								{/* Gradient Overlay - hidden when playing */}
								<div
									className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300 ${
										isPlaying[index] ? 'opacity-0' : 'opacity-20'
									}`}
								></div>

								{/* Top Info - hidden when playing */}
								<div
									className={`absolute top-3 md:top-6 left-3 md:left-6 right-3 md:right-6 z-20 transition-opacity duration-300 ${
										isPlaying[index] ? 'opacity-0' : 'opacity-100'
									}`}
								>
									<div className='flex items-center justify-between'>
										<div className='bg-red-500 rounded-full px-2 py-0.5 animate-pulse'>
											<span className='text-white font-bold text-[9px]'>
												LIVE
											</span>
										</div>
									</div>
								</div>

								{/* Bottom Info - hidden when playing */}
								<div
									className={`absolute bottom-20 md:bottom-24 left-3 md:left-6 right-3 md:right-6 z-20 transition-opacity duration-300 ${
										isPlaying[index] ? 'opacity-0' : 'opacity-100'
									}`}
								>
									<h3 className='text-base md:text-2xl font-bold text-white mb-1 md:mb-2'>
										{video.title}
									</h3>
									<p className='text-white/90 text-[11px] md:text-sm mb-2 md:mb-4'>
										{video.description}
									</p>
								</div>

								{/* Progress Bar - always visible at bottom */}
								<div className='absolute bottom-16 md:bottom-20 left-3 md:left-6 right-3 md:right-6 z-20'>
									<div className='w-full bg-white/20 rounded-full h-0.5 md:h-1 overflow-hidden backdrop-blur-sm'>
										<div
											className='h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100'
											style={{ width: `${progress[index]}%` }}
										></div>
									</div>
								</div>

								{/* Controls Overlay - moved to bottom center */}
								{(showControls[index] || !isPlaying[index]) && (
									<div className='absolute bottom-3 md:bottom-6 left-0 right-0 flex justify-center gap-3 z-20'>
										{[
											{
												icon: isPlaying[index] ? (
													<Pause className='w-4 h-4 text-white' />
												) : (
													<Play className='w-4 h-4 text-white' />
												),
												onClick: () => togglePlay(index),
											},
											{
												icon: isMuted[index] ? (
													<VolumeX className='w-4 h-4 text-white' />
												) : (
													<Volume2 className='w-4 h-4 text-white' />
												),
												onClick: () => toggleMute(index),
											},
											{
												icon: <RotateCcw className='w-4 h-4 text-white' />,
												onClick: () => restartVideo(index),
											},
										].map((btn, i) => (
											<button
												key={i}
												onClick={e => {
													e.stopPropagation()
													btn.onClick()
												}}
												className='w-9 h-9 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-all'
											>
												{btn.icon}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					))}
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