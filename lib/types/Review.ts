export interface Review {
  id: string;
  swapAgreementId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  completedSwaps: number;
}

export interface ReviewSummary extends Review {
  reviewer: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}
