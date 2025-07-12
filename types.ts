

export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'townhouse' | 'condo';
export type TransactionType = 'buy' | 'rent';

export interface PriceRange {
  min: number;
  max: number;
}

export interface AreaRange {
  min: number;
  max: number;
}

export interface Location {
  city: string;
  district?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  garden: boolean;
  balcony: boolean;
  elevator: boolean;
  furnished: boolean;
  petFriendly: boolean;
}

export interface PropertyFilter {
  propertyType?: PropertyType[];
  transactionType: TransactionType;
  priceRange?: PriceRange;
  areaRange?: AreaRange;
  location?: Location;
  features?: Partial<PropertyFeatures>;
  yearBuilt?: {
    min?: number;
    max?: number;
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  area: number;
  location: Location;
  features: PropertyFeatures;
  yearBuilt: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  featured?: boolean;
}
