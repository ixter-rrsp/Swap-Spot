export type VerificationIdType = "government_id" | "school_id";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationRequest {
  id: string;
  userId: string;
  idType: VerificationIdType;
  status: VerificationStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Admin-facing shape: includes signed URLs to view the uploaded files,
// plus the applicant's basic profile info for display in the dashboard.
export interface AdminVerificationRequest extends VerificationRequest {
  idDocumentUrl: string;
  selfieUrl: string;
  user: {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null;
}
