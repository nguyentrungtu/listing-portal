import { SafeUrl } from "@angular/platform-browser"

export interface Listing {
    id?: string, // auto-generated Firebase Id
    title?: string,
    description?: string,
    coverImage?: string | SafeUrl,
    imageFolderPath?: string;
    imageSources?: string[] | SafeUrl[],
    propertyType?: string,
    location?: string,
    address?: string,
    price?: number,
    currency?: 'USD' | 'VND'
    propertySize?: number,
    bedrooms?: number,
    bathrooms?: number,
    purpose?: 'For Rent' | 'For Sale',
    archived?: boolean
}

export interface SearchCriteria {
    propertyType: string,
    location: string,
    minPrice: number,
    maxPrice: number,
    propertySize: string,
    bedrooms: string,
    bathrooms: string
}

/* The following const is used for searching purposes ONLY */
export const PropertySizes: { [key: string]: string } = {
    _050to100: '50 to 100',
    _100to200: '100 to 200',
    _200to300: '200 to 300',
    _300to400: '300 to 400',
    _400plus: 'Over 400'
}