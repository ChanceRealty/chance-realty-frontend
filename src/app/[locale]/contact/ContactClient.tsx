// src/app/[locale]/contact/ContactClient.tsx - Updated with translations
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
	MapPin,
	Phone,
	Mail,
	Clock,
	Send,
	MessageCircle,
	CheckCircle,
	ArrowRight,
	HeadphonesIcon,
	Shield,
} from 'lucide-react'
import { useTranslations } from '@/translations/translations'
import { useLanguage } from '@/context/LanguageContext'

type FormData = {
	name: string
	email: string
	phone: string
	subject: string
	propertyType: string
	message: string
	preferredContact: string
}

const ContactClient = () => {
	const t = useTranslations()
	const { language } = useLanguage()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitSuccess, setSubmitSuccess] = useState(false)
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>()

	// Updated onSubmit function for ContactClient.tsx
	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					phone: data.phone,
					subject: data.subject,
					message: data.message,
					propertyInterest: data.propertyType,
					preferredContact: data.preferredContact,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send message')
			}

			setSubmitSuccess(true)
			reset()

			// Auto-hide success message after 5 seconds
			setTimeout(() => {
				setSubmitSuccess(false)
			}, 5000)
		} catch (error) {
			console.error('Error submitting form:', error)
			// You should add error state handling here
			alert(
				language === 'hy'
					? 'Խնդիր առաջացավ հաղորդագրության ուղարկման ժամանակ'
					: language === 'ru'
					? 'Произошла ошибка при отправке сообщения'
					: 'There was an error sending your message'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const addressContact = {
		icon: MapPin,
		text:
			language === 'hy'
				? 'Շիրվանզադե 24/30, Երևան, Հայաստան'
				: language === 'ru'
				? 'Шираванзаде 24/30, Ереван, Армения'
				: 'Shirvanzade 24/30, Yerevan, Armenia',

		href: '#',
	}

	const contactMethods = [
		{
			icon: Phone,
			title:
				language === 'hy'
					? 'Զանգահարել մեզ'
					: language === 'ru'
					? 'Позвонить нам'
					: 'Call Us',
			details: '+374 41 194 646',
			description:
				language === 'hy'
					? 'Երկ-Շաբ 10:00-ից 20:00-ը'
					: language === 'ru'
					? 'Пн-Сб с 10:00 до 20:00'
					: 'Mon-Sat from 10am to 8pm',
			color: 'blue',
			gradient: 'from-blue-500 to-blue-600',
			action: 'tel:+37441194646',
		},
		{
			icon: Mail,
			title:
				language === 'hy'
					? 'Էլ. նամակ ուղարկել'
					: language === 'ru'
					? 'Написать нам'
					: 'Email Us',
			details: 'chancerealty4646@gmail.com',
			description:
				language === 'hy'
					? 'Օնլայն աջակցություն'
					: language === 'ru'
					? 'Онлайн поддержка'
					: 'Online support',
			color: 'green',
			gradient: 'from-green-500 to-emerald-600',
			action: 'mailto:chancerealty4646@gmail.com',
		},
		{
			icon: MessageCircle,
			title:
				language === 'hy'
					? 'Ուղիղ զրույց'
					: language === 'ru'
					? 'Онлайн чат'
					: 'Live Chat',
			details:
				language === 'hy'
					? 'Սկսել զրույց'
					: language === 'ru'
					? 'Начать разговор'
					: 'Start a conversation',
			description:
				language === 'hy'
					? 'Մենք առցանց ենք'
					: language === 'ru'
					? 'Мы онлайн'
					: "We're online now",
			color: 'purple',
			gradient: 'from-purple-500 to-purple-600',
			action: '#',
		},
		{
			icon: MapPin,
			title:
				language === 'hy'
					? 'Այցելել մեզ'
					: language === 'ru'
					? 'Посетить нас'
					: 'Visit Us',
			details: addressContact.text,
			description:
				language === 'hy'
					? 'Եկեք ողջունեք մեզ'
					: language === 'ru'
					? 'Приходите поздороваться'
					: 'Come say hello',
			color: 'orange',
			gradient: 'from-orange-500 to-red-500',
			action: '#',
		},
	]

	const stats = [
		{ number: '10K+', label: t.happyClients, icon: '😊' },
		{ number: '24/7', label: t.customerSupport, icon: '🕒' },
		{ number: '98%', label: t.satisfactionRate, icon: '⭐' },
		{ number: '<2hrs', label: t.responseTime, icon: '⚡' },
	]

	const faqs = [
		{
			question:
				language === 'hy'
					? 'Որքա՞ն արագ կստանամ պատասխան:'
					: language === 'ru'
					? 'Как быстро я получу ответ?'
					: 'How quickly can I expect a response?',
			answer:
				language === 'hy'
					? 'Մենք ձգտում ենք պատասխանել բոլոր հարցումներին 2 ժամվա ընթացքում աշխատանքային օրերին (9:00-18:00): Շտապ հարցերի համար խնդրում ենք անմիջապես զանգահարել մեզ:'
					: language === 'ru'
					? 'Мы стремимся отвечать на все запросы в течение 2 часов в рабочие дни (9:00-18:00). По срочным вопросам, пожалуйста, звоните нам напрямую.'
					: 'We aim to respond to all inquiries within 2 hours during business days (9 AM - 6 PM). For urgent matters, please call us directly.',
		},
		{
			question:
				language === 'hy'
					? 'Առաջարկու՞մ եք գույքի դիտման ժամադրություններ:'
					: language === 'ru'
					? 'Предлагаете ли вы показы недвижимости?'
					: 'Do you offer property viewing appointments?',
			answer:
				language === 'hy'
					? 'Այո՛: Մենք առաջարկում ենք ինչպես անձնական, այնպես էլ վիրտուալ գույքի շրջագայություններ: Դուք կարող եք պայմանավորել հանդիպում մեր կապի ձևի միջոցով կամ անմիջապես զանգահարելով մեզ:'
					: language === 'ru'
					? 'Да! Мы предлагаем как личные, так и виртуальные туры по недвижимости. Вы можете записаться на прием через нашу контактную форму или позвонив нам напрямую.'
					: 'Yes! We offer both in-person and virtual property tours. You can schedule appointments through our contact form or by calling us directly.',
		},
		{
			question:
				language === 'hy'
					? 'Ո՞ր տարածքները եք սպասարկում:'
					: language === 'ru'
					? 'Какие районы вы обслуживаете?'
					: 'What areas do you serve?',
			answer:
				language === 'hy'
					? 'Մենք հիմնականում սպասարկում ենք Երևանը և Հայաստանի շրջակա տարածքները: Մեր հիմնական սպասարկման տարածքից դուրս գտնվող գույքի համար մենք կարող ենք կապել ձեզ վստահելի գործընկերների հետ:'
					: language === 'ru'
					? 'Мы в основном обслуживаем Ереван и прилегающие районы Армении. Для недвижимости вне нашей основной зоны обслуживания мы можем связать вас с надежными партнерами.'
					: 'We primarily serve Yerevan and surrounding areas in Armenia. For properties outside our main service area, we can connect you with trusted partners.',
		},
		{
			question:
				language === 'hy'
					? 'Կա՞ վճար ձեր խորհրդատվական ծառայությունների համար:'
					: language === 'ru'
					? 'Есть ли плата за ваши консультационные услуги?'
					: 'Is there a fee for your consultation services?',
			answer:
				language === 'hy'
					? 'Նախնական խորհրդատվությունը և գույքի որոնումը լիովին անվճար են: Մենք միայն հարկատու ենք գրավում հաջող գույքի գործարքների դեպքում:'
					: language === 'ru'
					? 'Первоначальные консультации и поиск недвижимости совершенно бесплатны. Мы взимаем комиссию только при успешных сделках с недвижимостью.'
					: 'Initial consultations and property searches are completely free. We only charge commission upon successful property transactions.',
		},
		{
			question:
				language === 'hy'
					? 'Կարո՞ղ եք օգնել գույքի ֆինանսավորման հետ:'
					: language === 'ru'
					? 'Можете ли вы помочь с финансированием недвижимости?'
					: 'Can you help with property financing?',
			answer:
				language === 'hy'
					? 'Այո, մենք աշխատում ենք տարբեր բանկերի և ֆինանսական հաստատությունների հետ՝ ձեզ օգնելու գտնել ձեր գույքի գնման համար լավագույն ֆինանսավորման տարբերակները:'
					: language === 'ru'
					? 'Да, мы работаем с различными банками и финансовыми учреждениями, чтобы помочь вам найти лучшие варианты финансирования для покупки недвижимости.'
					: 'Yes, we work with various banks and financial institutions to help you find the best financing options for your property purchase.',
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

				<div className='container mx-auto px-4 py-20 md:py-28 relative z-10'>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className='max-w-4xl mx-auto text-center'
					>
						{/* Icon */}
						<div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6 backdrop-blur-sm shadow-2xl'>
							<MessageCircle className='w-10 h-10 text-white' />
						</div>

						<h1 className='text-5xl md:text-7xl font-bold mb-6 leading-tight'>
							{t.contactTitle}
						</h1>
						<p className='text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8'>
							{t.contactSubtitle}
						</p>

						{/* Quick stats */}
						<div className='grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto'>
							{stats.map((stat, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className='text-center'
								>
									<div className='text-3xl mb-1'>{stat.icon}</div>
									<div className='text-2xl font-bold text-white'>
										{stat.number}
									</div>
									<div className='text-blue-200 text-sm'>{stat.label}</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>

			{/* Quick Contact Methods */}
			<div className='relative -mt-16 z-10'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
						{contactMethods.map((method, index) => (
							<motion.a
								key={index}
								href={method.action}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className='group bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center'
							>
								<div
									className={`w-16 h-16 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
								>
									<method.icon className='w-8 h-8 text-white' />
								</div>
								<h3 className='text-lg font-bold text-gray-900 mb-1'>
									{method.title}
								</h3>
								<p className='text-blue-600 font-semibold mb-1'>
									{method.details}
								</p>
								<p className='text-gray-600 text-sm'>{method.description}</p>
								<div className='mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
									<ArrowRight
										className={`w-4 h-4 text-${method.color}-600 mx-auto`}
									/>
								</div>
							</motion.a>
						))}
					</div>
				</div>
			</div>

			{/* Main Contact Section */}
			<div className='container mx-auto px-4 py-20'>
				<div className='min-h-screen flex items-center justify-center px-4'>
					<div className='w-full max-w-3xl'>
						<div className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
							<div className='text-center mb-8'>
								<div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
									<Send className='w-8 h-8 text-white' />
								</div>
								<h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
									{t.sendMessage}
								</h2>

								<p className='text-gray-600'>
									{language === 'hy'
										? 'Լրացրեք ստորև բերված ձևը և մենք կպատասխանենք ձեզ հնարավորինս արագ:'
										: language === 'ru'
										? 'Заполните форму ниже, и мы свяжемся с вами как можно скорее.'
										: "Fill out the form below and we'll get back to you as soon as possible."}
								</p>
							</div>

							{submitSuccess ? (
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									className='text-center py-12'
								>
									<div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
										<CheckCircle className='w-12 h-12 text-green-600' />
									</div>
									<h3 className='text-2xl font-bold text-green-600 mb-3'>
										{language === 'hy'
											? 'Հաղորդագրությունը հաջողությամբ ուղարկվեց!'
											: language === 'ru'
											? 'Сообщение успешно отправлено!'
											: 'Message Sent Successfully!'}
									</h3>
									<p className='text-gray-600 mb-6'>{t.weWillRespond}</p>
									<div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
										<div className='flex items-center'>
											<Clock className='w-4 h-4 mr-2' />
											<span>
												{language === 'hy'
													? 'Պատասխան 2 ժամվա ընթացքում'
													: language === 'ru'
													? 'Ответ в течение 2 часов'
													: 'Response within 2 hours'}
											</span>
										</div>
										<div className='flex items-center'>
											<HeadphonesIcon className='w-4 h-4 mr-2' />
											<span>
												{language === 'hy'
													? 'Փորձագետ խորհրդատվություն'
													: language === 'ru'
													? 'Экспертная консультация'
													: 'Expert consultation'}
											</span>
										</div>
									</div>
								</motion.div>
							) : (
								<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
									{/* Personal Information */}
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div className='group'>
											<label
												htmlFor='name'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.name} *
											</label>
											<input
												type='text'
												id='name'
												className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
													errors.name
														? 'border-red-300 bg-red-50'
														: 'border-gray-200 hover:border-gray-300'
												}`}
												{...register('name', {
													required:
														language === 'hy'
															? 'Անունը պարտադիր է'
															: language === 'ru'
															? 'Имя обязательно'
															: 'Name is required',
												})}
											/>
											{errors.name && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className='mt-2 text-sm text-red-600 flex items-center'
												>
													<span className='mr-1'>⚠️</span>
													{errors.name.message}
												</motion.p>
											)}
										</div>

										<div className='group'>
											<label
												htmlFor='email'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.email} *
											</label>
											<input
												type='email'
												id='email'
												className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
													errors.email
														? 'border-red-300 bg-red-50'
														: 'border-gray-200 hover:border-gray-300'
												}`}
												{...register('email', {
													required:
														language === 'hy'
															? 'Էլ. փոստը պարտադիր է'
															: language === 'ru'
															? 'Email обязателен'
															: 'Email is required',
													pattern: {
														value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
														message:
															language === 'hy'
																? 'Անվավեր էլ. փոստի հասցե'
																: language === 'ru'
																? 'Неверный адрес электронной почты'
																: 'Invalid email address',
													},
												})}
											/>
											{errors.email && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className='mt-2 text-sm text-red-600 flex items-center'
												>
													<span className='mr-1'>⚠️</span>
													{errors.email.message}
												</motion.p>
											)}
										</div>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div className='group'>
											<label
												htmlFor='phone'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.phone}
											</label>
											<input
												type='tel'
												id='phone'
												className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300'
												{...register('phone')}
											/>
										</div>

										<div className='group'>
											<label
												htmlFor='propertyType'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.propertyInterest}
											</label>
											<select
												id='propertyType'
												className='w-full px-4 text-gray-600 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 bg-white'
												{...register('propertyType')}
											>
												<option value=''>{t.selectPropertyType}</option>
												<option value='house'>{t.house}</option>
												<option value='apartment'>{t.apartment}</option>
												<option value='commercial'>{t.commercial}</option>
												<option value='land'>{t.land}</option>
											</select>
										</div>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div className='group'>
											<label
												htmlFor='subject'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.subject} *
											</label>
											<input
												type='text'
												id='subject'
												className={`w-full text-gray-600 px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
													errors.subject
														? 'border-red-300 bg-red-50'
														: 'border-gray-200 hover:border-gray-300'
												}`}
												placeholder={
													language === 'hy'
														? 'Ինչպե՞ս կարող ենք օգնել ձեզ:'
														: language === 'ru'
														? 'Как мы можем вам помочь?'
														: 'How can we help you?'
												}
												{...register('subject', {
													required:
														language === 'hy'
															? 'Թեման պարտադիր է'
															: language === 'ru'
															? 'Тема обязательна'
															: 'Subject is required',
												})}
											/>
											{errors.subject && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className='mt-2 text-sm text-red-600 flex items-center'
												>
													<span className='mr-1'>⚠️</span>
													{errors.subject.message}
												</motion.p>
											)}
										</div>

										<div className='group'>
											<label
												htmlFor='preferredContact'
												className='block text-sm font-semibold text-gray-700 mb-2'
											>
												{t.preferredContact}
											</label>
											<select
												id='preferredContact'
												className='w-full text-gray-600 px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 bg-white'
												{...register('preferredContact')}
											>
												<option value=''>
													{language === 'hy'
														? 'Նախապատվություն չկա'
														: language === 'ru'
														? 'Без предпочтений'
														: 'No preference'}
												</option>
												<option value='email'>{t.email}</option>
												<option value='phone'>{t.phone}</option>
												<option value='whatsapp'>WhatsApp</option>
											</select>
										</div>
									</div>

									<div className='group'>
										<label
											htmlFor='message'
											className='block text-sm font-semibold text-gray-700 mb-2'
										>
											{t.message} *
										</label>
										<textarea
											id='message'
											rows={6}
											className={`w-full px-4 text-gray-600 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none ${
												errors.message
													? 'border-red-300 bg-red-50'
													: 'border-gray-200 hover:border-gray-300'
											}`}
											placeholder={
												language === 'hy'
													? 'Պատմեք մեզ ձեր գույքի կարիքների, հարցերի կամ թե ինչպես կարող ենք օգնել ձեզ...'
													: language === 'ru'
													? 'Расскажите нам о ваших потребностях в недвижимости, вопросах или о том, как мы можем вам помочь...'
													: 'Tell us about your property needs, questions, or how we can assist you...'
											}
											{...register('message', {
												required:
													language === 'hy'
														? 'Հաղորդագրությունը պարտադիր է'
														: language === 'ru'
														? 'Сообщение обязательно'
														: 'Message is required',
											})}
										/>
										{errors.message && (
											<motion.p
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className='mt-2 text-sm text-red-600 flex items-center'
											>
												<span className='mr-1'>⚠️</span>
												{errors.message.message}
											</motion.p>
										)}
									</div>

									<div className='flex flex-col sm:flex-row gap-3'>
										<button
											type='submit'
											disabled={isSubmitting}
											className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-6 sm:py-4 sm:px-8 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none'
										>
											{isSubmitting ? (
												<>
													<div className='w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
													<span>{t.sending}</span>
												</>
											) : (
												<>
													<Send className='h-4 w-4 sm:h-5 sm:w-5' />
													<span>{t.sendMessage}</span>
												</>
											)}
										</button>

										<button
											type='button'
											onClick={() => reset()}
											className='px-6 py-2.5 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-50 transition-colors'
										>
											{t.clear}{' '}
											{language === 'hy'
												? ''
												: language === 'ru'
												? 'форму'
												: 'Form'}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* FAQ Section */}
			<div className='bg-white py-20'>
				<div className='container mx-auto px-4'>
					<div className='max-w-4xl mx-auto'>
						<div className='text-center mb-16'>
							<div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
								<MessageCircle className='w-8 h-8 text-white' />
							</div>
							<h2 className='text-4xl font-bold text-gray-900 mb-4'>{t.faq}</h2>
							<p className='text-xl text-gray-600'>
								{language === 'hy'
									? 'Գտեք պատասխաններ մեր ծառայությունների և աջակցության վերաբերյալ ընդհանուր հարցերի:'
									: language === 'ru'
									? 'Найдите ответы на общие вопросы о наших услугах и поддержке.'
									: 'Find answers to common questions about our services and support.'}
							</p>
						</div>

						<div className='space-y-6'>
							{faqs.map((faq, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors duration-200 border border-gray-100'
								>
									<h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
										<div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3'>
											<span className='text-blue-600 font-bold text-sm'>
												{index + 1}
											</span>
										</div>
										{faq.question}
									</h3>
									<p className='text-gray-600 leading-relaxed ml-11'>
										{faq.answer}
									</p>
								</motion.div>
							))}
						</div>

						{/* CTA after FAQ */}
						<div className='text-center mt-12 px-4 sm:px-0'>
							<p className='text-gray-600 mb-4 text-sm sm:text-base'>
								{language === 'hy'
									? 'Դեռ հարցեր ունե՞ք: Մենք այստեղ ենք օգնելու:'
									: language === 'ru'
									? 'Остались вопросы? Мы здесь, чтобы помочь!'
									: "Still have questions? We're here to help!"}
							</p>
							<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
								<a
									href='tel:+37400000000'
									className='inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base'
								>
									<Phone className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
									{language === 'hy'
										? 'Զանգահարել հիմա'
										: language === 'ru'
										? 'Позвонить сейчас'
										: 'Call Us Now'}
								</a>
								<a
									href='mailto:info@chancerealty.am'
									className='inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-sm sm:text-base'
								>
									<Mail className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
									{language === 'hy'
										? 'Ուղարկել էլ. նամակ'
										: language === 'ru'
										? 'Отправить email'
										: 'Send Email'}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ContactClient