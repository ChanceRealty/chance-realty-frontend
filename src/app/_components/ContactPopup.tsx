// Add this new component to your file or create a separate component file

import { ChevronRight, Phone, X } from "lucide-react";
import { FaTelegram, FaViber, FaWhatsapp } from "react-icons/fa";

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const ContactPopup = ({ isOpen, onClose, language }: ContactPopupProps) => {
  if (!isOpen) return null;

  const getContactTitle = (lang: string) => {
    switch (lang) {
      case 'hy': return 'Կապվել մեզ հետ';
      case 'ru': return 'Связаться с нами';
      default: return 'Contact Us';
    }
  };

  const getCallText = (lang: string) => {
    switch (lang) {
      case 'hy': return 'Զանգահարել';
      case 'ru': return 'Позвонить';
      default: return 'Call';
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      label: getCallText(language),
      value: '+374 41 194 646',
      href: 'tel:+37441194646',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Phone,
      label: getCallText(language),
      value: '+374 77 194 646',
      href: 'tel:+37477194646',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Phone,
      label: getCallText(language),
      value: '+374 93 194 646',
      href: 'tel:+37493194646',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];

  const socialMethods = [
    {
                                        name: 'WhatsApp',
                                        href: 'https://wa.me/37441194646',
                                        icon: <FaWhatsapp />,
                                        color: 'hover:bg-green-600',
                                        bgColor: 'bg-green-500',
                                    },
   {
                                    name: 'Viber',
                                    href: 'viber://chat?number=37441194646',
                                    icon: <FaViber />,
                                    color: 'hover:bg-purple-600',
                                    bgColor: 'bg-purple-500',
                                },
    {
                                        name: 'Telegram',
                                        href: 'https://t.me/+37441194646',
                                        icon: <FaTelegram />,
                                        color: 'hover:bg-blue-500',
                                        bgColor: 'bg-blue-400',
                                    },
  ];

  return (
		<div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn'
            onClick={onClose}
        >
			<div className='bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp'>
				{/* Header */}
				<div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl relative'>
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors'
						aria-label='Close'
					>
						<X className='w-5 h-5' />
					</button>
					<h2 className='text-2xl font-bold text-white mb-2'>
						{getContactTitle(language)}
					</h2>
					<p className='text-blue-100 text-sm'>
						{language === 'hy'
							? 'Ընտրեք հարմար եղանակը'
							: language === 'ru'
							? 'Выберите удобный способ'
							: 'Choose your preferred method'}
					</p>
				</div>

				{/* Content */}
				<div className='p-6 space-y-6'>
					{/* Phone Numbers */}
					<div>
						<h3 className='text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3'>
							{language === 'hy'
								? 'Հեռախոսահամարներ'
								: language === 'ru'
								? 'Телефонные номера'
								: 'Phone Numbers'}
						</h3>
						<div className='space-y-3'>
							{contactMethods.map((method, index) => (
								<a
									key={index}
									href={method.href}
									className={`flex items-center justify-between p-4 rounded-xl ${method.color} text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
								>
									<div className='flex items-center space-x-3'>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<method.icon className='w-5 h-5' />
										</div>
										<div>
											<p className='text-xs font-medium opacity-90'>
												{method.label}
											</p>
											<p className='font-semibold text-lg'>{method.value}</p>
										</div>
									</div>
									<ChevronRight className='w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
								</a>
							))}
						</div>
					</div>

					{/* Divider */}
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-200'></div>
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='px-4 bg-white text-gray-500 font-medium'>
								{language === 'hy'
									? 'Կամ գրեք մեզ'
									: language === 'ru'
									? 'Или напишите нам'
									: 'Or message us'}
							</span>
						</div>
					</div>

					{/* Social Media */}
					<div>
						<h3 className='text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3'>
							{language === 'hy'
								? 'Մեսենջերներ'
								: language === 'ru'
								? 'Мессенджеры'
								: 'Messengers'}
						</h3>
						<div className='grid grid-cols-3 gap-3'>
							{socialMethods.map((social, index) => (
								<a
									key={index}
									href={social.href}
									target='_blank'
									rel='noopener noreferrer'
									className={`flex flex-col items-center justify-center p-4 rounded-xl ${social.bgColor} ${social.color} text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
								>
									<span className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
										{social.icon}
									</span>
									<span className='text-xs font-semibold'>{social.name}</span>
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

export default ContactPopup;