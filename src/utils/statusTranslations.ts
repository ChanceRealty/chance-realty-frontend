// Add this to src/utils/statusTranslations.ts
import { PropertyStatus } from '@/types/property';
import { CheckCircle, Clock, XCircle, Pause, AlertCircle } from 'lucide-react'
export function getTranslatedStatus(
	status: PropertyStatus,
	language: 'hy' | 'en' | 'ru'
): { label: string; icon: React.ComponentType<{ className?: string }> } {
	const statusStr =
		typeof status === 'object' ? status?.name || 'active' : String(status)

	const statusTranslations: Record<
		string,
		Record<
			string,
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
		statusTranslations[statusStr.toLowerCase()]?.[language] ||
		statusTranslations.active[language]
	)
}
