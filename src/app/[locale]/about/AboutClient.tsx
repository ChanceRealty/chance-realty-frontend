// src/app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import {
	Home,
	Users,
	Heart,
	Zap,
	Shield,
	TrendingUp,
	Star,
	CheckCircle,
	Globe,
	Building2,
	UserCheck,
	Calendar,
	HeartHandshake,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'

const AboutClient = () => {
	const t = useTranslations()

	const stats = [
		{
			number: '15+',
			label: t.yearsExperience,
			icon: Calendar,
			color: 'blue',
		},
		{ number: '10,000+', label: t.happyClients, icon: Users, color: 'green' },
		{ number: '5,000+', label: t.sold, icon: Home, color: 'purple' },
		{
			number: '98%',
			label: t.satisfactionRate,
			icon: Star,
			color: 'orange',
		},
		{ number: '50+', label: t.expertTeam, icon: UserCheck, color: 'red' },
		{
			number: '24/7',
			label: t.support,
			icon: Shield,
			color: 'indigo',
		},
	]

	const values = [
		{
			icon: Heart,
			title: t.centeredApproach,
			description: t.centeredApproachDescription,
			color: 'red',
			gradient: 'from-red-500 to-pink-600',
		},
		{
			icon: Shield,
			title: t.trustTransparency,
			description:
				t.trustTransparencyDescription,
			color: 'blue',
			gradient: 'from-blue-500 to-indigo-600',
		},
		{
			icon: Zap,
			title: t.innovation,
			description:
				t.innovationDescription,
			color: 'yellow',
			gradient: 'from-yellow-500 to-orange-600',
		},
		{
			icon: TrendingUp,
			title: t.excellence,
			description:
				t.excellenceDescription,
			color: 'green',
			gradient: 'from-green-500 to-emerald-600',
		},
	]


	return (
		<div className='bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 min-h-screen'>
			{/* Hero Section */}
			<div className='relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden'>
				{/* Background decorations */}
				<div className='absolute inset-0'>
					<div className='absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse'></div>
					<div className='absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-lg transform rotate-45 animate-pulse animation-delay-1000'></div>
					<div className='absolute bottom-32 left-1/4 w-28 h-28 border border-white/15 rounded-full animate-pulse animation-delay-2000'></div>
					<div className='absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-600/20 to-pink-600/20 rounded-full'></div>
				</div>

				<div className='container mx-auto px-4 py-20 md:py-32 relative z-10'>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className='max-w-5xl mx-auto text-center'
					>
						{/* Logo/Icon */}
						<div className='inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8 backdrop-blur-sm shadow-2xl'>
							<Building2 className='w-12 h-12 text-white' />
						</div>

						<h1 className='text-5xl md:text-7xl font-bold mb-8 leading-tight'>
							{t.aboutTitle}
							<span className='block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>
								Chance Realty
							</span>
						</h1>

						<p className='text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed whitespace-pre-line mb-12'>
							{t.aboutSubtitle}
						</p>
					</motion.div>
				</div>
			</div>

			{/* Company Stats */}
			<div className='py-20'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							{t.impact}
						</h2>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto cursor-pointer'>
						{stats.map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className='text-center group'
							>
								<div
									className={`w-20 h-20 bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
								>
									<stat.icon className='w-10 h-10 text-white' />
								</div>
								<div className='text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
									{stat.number}
								</div>
								<div className='text-gray-800 text-sm'>{stat.label}</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Our Values */}
			<div className='bg-white py-20'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-16'>
						<div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
							<Heart className='w-8 h-8 text-white' />
						</div>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							{t.coreValues}
						</h2>
						<p className='text-xl text-gray-600 max-w-2xl mx-auto'>
							{t.coreValuesDescription}
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
						{values.map((value, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								className='group bg-gray-50 hover:bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300'
							>
								<div
									className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
								>
									<value.icon className='w-8 h-8 text-white' />
								</div>
								<h3 className='text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors'>
									{value.title}
								</h3>
								<p className='text-gray-600 leading-relaxed'>
									{value.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Why Choose Us Section */}
			<div className='bg-gradient-to-br from-gray-50 to-blue-50 py-20'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-16'>
						<div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
							<CheckCircle className='w-8 h-8 text-white' />
						</div>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							{t.whyChooseUs}
						</h2>
						<p className='text-xl text-gray-600 max-w-2xl mx-auto'>
							{t.whyChooseUsDescription}
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
						{[
							{
								icon: Shield,
								title: t.trustedReliable,
								description: t.trustedReliableDescription,
								color: 'blue',
								stats: `10,000+ ${t.happyClients}`,
							},
							{
								icon: Users,
								title: t.expertTeam,
								description: t.expertTeamDescription,
								color: 'green',
								stats: `50+ ${t.expertTeam}`,
							},
							{
								icon: Zap,
								title: t.fastEfficient,
								description: t.fastEfficientDescription,
								color: 'yellow',
								stats: 'Average 30-day closing',
							},
							{
								icon: HeartHandshake,
								title: t.personalizedService,
								description: t.personalizedServiceDescription,
								color: 'red',
								stats: '24/7 customer support',
							},
							{
								icon: TrendingUp,
								title: t.marketLeadership,
								description: t.marketLeadershipDescription,
								color: 'purple',
								stats: '#1 in Yerevan',
							},
							{
								icon: Globe,
								title: t.technologyDriven,
								description: t.technologyDrivenDescription,
								color: 'indigo',
								stats: 'Digital-first approach',
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group'
							>
								<div
									className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
								>
									<feature.icon className='w-8 h-8 text-white' />
								</div>
								<h3 className='text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors'>
									{feature.title}
								</h3>
								<p className='text-gray-600 mb-4 leading-relaxed'>
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Custom Styles */}
			<style jsx>{`
				.animation-delay-1000 {
					animation-delay: 1s;
				}
				.animation-delay-2000 {
					animation-delay: 2s;
				}

				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}

				.animate-float {
					animation: float 6s ease-in-out infinite;
				}
			`}</style>
		</div>
	)
}

export default AboutClient
