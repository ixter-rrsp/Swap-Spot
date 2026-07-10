export interface Listing {
  id: string;

  title: string;

  description: string;

  imageUrl?: string;

  city: string;

  swapValue: number;

  lookingFor: string;

  rating?: number;

  boosted?: boolean;

  owner: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
}