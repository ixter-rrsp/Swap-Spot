import { createClient } from "@/utils/supabase/server";
import type {
  VerificationIdType,
  VerificationRequest,
  VerificationStatus,
} from "@/lib/types/VerificationRequest";

interface VerificationRequestRow {
  id: string;
  user_id: string;
  id_type: VerificationIdType;
  id_document_path: string;
  selfie_path: string;
  status: VerificationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRequest(row: VerificationRequestRow): VerificationRequest {
  return {
    id: row.id,
    userId: row.user_id,
    idType: row.id_type,
    status: row.status,
    adminNotes: row.admin_notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ID_TYPES: VerificationIdType[] = ["government_id", "school_id"];

interface CreateVerificationRequestInput {
  idType: VerificationIdType;
  idDocumentPath: string;
  selfiePath: string;
}

export async function createVerificationRequest({
  idType,
  idDocumentPath,
  selfiePath,
}: CreateVerificationRequestInput): Promise<VerificationRequest> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!ID_TYPES.includes(idType)) {
    throw new Error("Invalid ID type.");
  }

  // Already verified — nothing to do.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("id", user.id)
    .single();

  if (profile?.is_verified) {
    throw new Error("Your account is already verified.");
  }

  const { data, error } = await supabase
    .from("verification_requests")
    .insert({
      user_id: user.id,
      id_type: idType,
      id_document_path: idDocumentPath,
      selfie_path: selfiePath,
    })
    .select()
    .single();

  if (error) {
    // Unique partial index blocks a second pending request from the
    // same user while one is still awaiting review.
    if (error.code === "23505") {
      throw new Error(
        "You already have a verification request pending review."
      );
    }
    throw new Error(error.message);
  }

  return mapRequest(data as VerificationRequestRow);
}

/**
 * Returns the current user's most recent verification request, if any
 * (used to show pending/rejected status on the Edit Profile page).
 */
export async function getMyLatestVerificationRequest(): Promise<VerificationRequest | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRequest(data as VerificationRequestRow) : null;
}
