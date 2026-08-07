export interface Profile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  city: string | null;
  bio: string | null;

  swapRadius: number;

  latitude: number | null;
  longitude: number | null;

  rating: number;
  badge: string;
  isVerified: boolean;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string | null;
}