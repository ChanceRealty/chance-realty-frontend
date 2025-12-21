import { PropertyStatus } from '@/types/property'
import { CheckCircle, Clock, XCircle, Pause, AlertCircle } from 'lucide-react'
import React from 'react'

type StatusValue = 'active' | 'pending' | 'sold' | 'rented' | 'inactive'

export function getTranslatedStatus(
	status: PropertyStatus | StatusValue | string,
	language: 'hy' | 'en' | 'ru'
): { label: string; icon: React.ComponentType<{ className?: string }> } {
	const statusStr =
		typeof status === 'string' ? status : status?.name ?? 'active'

	const statusTranslations: Record<
		StatusValue,
		Record<
			'hy' | 'en' | 'ru',
			{ label: string; icon: React.ComponentType<{ className?: string }> }
		>
	> = {
		active: {
			hy: { label: 'Ակտիվ', icon: CheckCircle },
			en: { label: 'Active', icon: CheckCircle },
			ru: { label: 'Активный', icon: CheckCircle },
		},
		pending: {
			hy: { label: 'Սպասող', icon: Clock },
			en: { label: 'Pending', icon: Clock },
			ru: { label: 'В ожидании', icon: Clock },
		},
		sold: {
			hy: { label: 'Վաճառված', icon: XCircle },
			en: { label: 'Sold', icon: XCircle },
			ru: { label: 'Продано', icon: XCircle },
		},
		rented: {
			hy: { label: 'Վարձակալված', icon: Pause },
			en: { label: 'Rented', icon: Pause },
			ru: { label: 'Арендовано', icon: Pause },
		},
		inactive: {
			hy: { label: 'Ոչ ակտիվ', icon: AlertCircle },
			en: { label: 'Inactive', icon: AlertCircle },
			ru: { label: 'Неактивный', icon: AlertCircle },
		},
	}

	return (
		statusTranslations[statusStr.toLowerCase() as StatusValue]?.[language] ??
		statusTranslations.active[language]
	)
}
