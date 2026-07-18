export interface Listing {
  id: string;

  title: string;

  description: string;

  imageUrl?: string;

  images: ListingImage[];

  city: string;

  swapValue: number;

  lookingFor: string;

  boosted?: boolean;

  owner: ListingOwner;

  distance?: number;
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