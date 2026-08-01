export interface Listing {
  id: string;

  title: string;

  description: string;

  imageUrl?: string;

  images: ListingImage[];

  city: string;

  swapValue: number;

  lookingFor: string;

  category: string;

  condition: string;

  boosted?: boolean;

  boostExpiresAt?: string | null;

  owner: ListingOwner;

  distance?: number;

  latitude?: number | null;

  longitude?: number | null;

  landmarkLatitude?: number | null;

  landmarkLongitude?: number | null;

  nearbyLandmark?: string | null;

  showOnMap?: boolean;
}

export interface ListingImage {
  id: string;

  url: string;

  sortOrder: number;
}

export interface ListingOwner {
  id: string;

  username: string;

  fullName: string;

  avatarUrl?: string | null;

  rating: number;

  badge: string;

  city: string;

  latitude?: number | null;

  longitude?: number | null;
}