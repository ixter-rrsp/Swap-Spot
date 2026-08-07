import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";
import { getVerificationSignedUrls } from "@/lib/services/serverStorageServices";
import type { AdminVerificationRequest } from "@/lib/types/VerificationRequest";

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];

  // Resolve every id-document / selfie storage path to a short-lived
  // signed URL in one batch so the dashboard can render the images.
  const allPaths = rows.flatMap((row) => [row.id_document_path, row.selfie_path]);
  const signedUrls = await getVerificationSignedUrls(allPaths);

  const result: AdminVerificationRequest[] = rows.map((row: any) => ({
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
    user: row.user
      ? {
          id: row.user.id,
          username: row.user.username,
          fullName: row.user.full_name,
          avatarUrl: row.user.avatar_url,
          isVerified: row.user.is_verified ?? false,
        }
      : null,
  }));

  return NextResponse.json(result);
}
