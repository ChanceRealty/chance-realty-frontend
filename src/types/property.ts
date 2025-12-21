export type ListingType = 'sale' | 'rent' | 'daily_rent'
export type PropertyType = 'house' | 'apartment' | 'commercial' | 'land'
export type MediaType = 'image' | 'video'
type PropertyStatusValue = 'available' | 'sold' | 'rented' | 'pending'

export interface State {
	id: number
	name: string
	uses_districts: boolean
	district_count?: number
	city_count?: number
}

export interface PropertyStatus {
	id: number
	name: string
	color: string
	is_active: boolean
	sort_order: number
}


export interface District {
	id: number
	name: string
	name_hy: string
	name_en?: string
	name_ru?: string
	state_id: number
}

export interface City {
	id: number
	state_id: number
	name: string
	district_id?: number 
	state?: State
	district?: District
}

export interface PropertyFeature {
	id: number
	name: string
	icon?: string
}

export interface BaseProperty {
	id: number
	user_id: number
	custom_id: string
	title: string
	description?: string
	property_type: PropertyType
	listing_type: ListingType
	price: number
	currency: string
	state_id: number
	city_id: number
	address: string
	postal_code?: string
	latitude?: number
	longitude?: number
	status: PropertyStatusValue | PropertyStatus
	views: number
	url_3d?: string | null
	created_at: Date
	updated_at: Date

	// Relations
	state?: State
	city?: City
	district?: District
	features?: PropertyFeature[]
	images?: PropertyMedia[]
	status_info?: PropertyStatus

	is_hidden: boolean
	is_exclusive: boolean
}

export interface HouseAttributes {
	property_id: number
	bedrooms: number
	bathrooms: number
	area_sqft: number
	lot_size_sqft?: number
	floors?: number
	ceiling_height?: number
}

export interface ApartmentAttributes {
	property_id: number
	bedrooms: number
	bathrooms: number
	area_sqft: number
	floor: number
	total_floors: number
	ceiling_height?: number
}

export interface CommercialAttributes {
	property_id: number
	business_type?: string
	area_sqft: number
	floors?: number
	ceiling_height?: number
	rooms?: number
}

export interface LandAttributes {
	property_id: number
	area_acres: number
}

export interface PropertyMedia {
	id: number
	property_id: number
	file_id: string
	url: string
	thumbnail_url?: string
	thumbnailUrl?: string // For compatibility with camelCase
	type: MediaType
	caption?: string
	image_type?: string // For backwards compatibility
	display_order: number
	displayOrder?: number // For compatibility with camelCase
	is_primary: boolean
	isPrimary?: boolean // For compatibility with camelCase
}


export interface PropertyFilter {
	property_type?: PropertyType
	listing_type?: ListingType
	state_id?: number | number[]
	city_id?: number | number[]
	district_id?: number | number[]
	min_price?: number
	max_price?: number
	bedrooms?: number
	bathrooms?: number
	rooms?: number
	features?: number[]
	status?: string
	sort_by?: 'price' | 'created_at' | 'views'
	sort_order?: 'asc' | 'desc'
	page?: number
	limit?: number
	floors?: number
	floor?: number
	total_floors?: number
	ceiling_height?: number
	min_lot_size_sqft?: number
	max_lot_size_sqft?: number
	min_area_sqft?: number
	max_area_sqft?: number
	business_type?: string
	min_area_acres?: number
	max_area_acres?: number
	is_hidden?: boolean
	is_exclusive?: boolean
	show_hidden?: boolean
}

export interface HouseProperty extends BaseProperty {
	property_type: 'house'
	attributes: HouseAttributes
}

export interface ApartmentProperty extends BaseProperty {
	property_type: 'apartment'
	attributes: ApartmentAttributes
}

export interface CommercialProperty extends BaseProperty {
	property_type: 'commercial'
	attributes: CommercialAttributes
}

export interface LandProperty extends BaseProperty {
	property_type: 'land'
	attributes: LandAttributes
}

export type Property =
	| HouseProperty
	| ApartmentProperty
	| CommercialProperty
	| LandProperty