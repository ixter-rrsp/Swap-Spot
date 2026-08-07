import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";
import { getVerificationSignedUrls } from "@/lib/services/serverStorageServices";
import type {
  AdminVerificationRequest,
  VerificationIdType,
  VerificationStatus,
} from "@/lib/types/VerificationRequest";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service role is not configured on the server." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // pending | approved | rejected | all

  let query = supabase
    .from("verification_requests")
    .select(
      `
      id,
      user_id,
      id_type,
      id_document_path,
      selfie_path,
      status,
      admin_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at,
      user:profiles!verification_requests_user_id_fkey(id, username, full_name, avatar_url, is_verified)
      `
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching verification requests:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  interface VerificationProfileRow {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  }

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
    // Supabase types a `!fk(...)` embed as an array even when the FK is
    // one-to-one, since it can't statically prove uniqueness — it's always
    // 0 or 1 items in practice here, so we take the first below.
    user: VerificationProfileRow[] | VerificationProfileRow | null;
  }

  const rows = (data ?? []) as unknown as VerificationRequestRow[];

  // Resolve every id-document / selfie storage path to a short-lived
  // signed URL in one batch so the dashboard can render the images.
  const allPaths = rows.flatMap((row) => [row.id_document_path, row.selfie_path]);
  const signedUrls = await getVerificationSignedUrls(allPaths);

  const result: AdminVerificationRequest[] = rows.map((row) => {
    const profile = Array.isArray(row.user) ? row.user[0] ?? null : row.user;

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
      idDocumentUrl: signedUrls[row.id_document_path] ?? "",
      selfieUrl: signedUrls[row.selfie_path] ?? "",
      user: profile
        ? {
            id: profile.id,
            username: profile.username,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            isVerified: profile.is_verified ?? false,
          }
        : null,
    };
  });

  return NextResponse.json(result);
}