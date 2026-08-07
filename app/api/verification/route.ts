import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import {
  createVerificationRequest,
  getMyLatestVerificationRequest,
} from "@/lib/services/ServerVerificationService";
import { uploadVerificationDocument } from "@/lib/services/serverStorageServices";
import type { VerificationIdType } from "@/lib/types/VerificationRequest";

const ID_TYPES: VerificationIdType[] = ["government_id", "school_id"];

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function GET() {
  try {
    const request = await getMyLatestVerificationRequest();
    return NextResponse.json({ request });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load verification status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const idType = formData.get("idType") as VerificationIdType | null;
    const idDocument = formData.get("idDocument");
    const selfie = formData.get("selfie");

    if (!idType || !ID_TYPES.includes(idType)) {
      return NextResponse.json(
        { error: "Please select a valid ID type." },
        { status: 400 }
      );
    }

    if (!(idDocument instanceof File) || idDocument.size === 0) {
      return NextResponse.json(
        { error: "Please upload a photo of your ID." },
        { status: 400 }
      );
    }

    if (!(selfie instanceof File) || selfie.size === 0) {
      return NextResponse.json(
        { error: "Please upload a selfie holding your ID." },
        { status: 400 }
      );
    }

    if (idDocument.size > MAX_FILE_SIZE || selfie.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Each photo must be under 8MB." },
        { status: 400 }
      );
    }

    const idDocumentPath = await uploadVerificationDocument(
      idDocument,
      user.id,
      "id"
    );
    const selfiePath = await uploadVerificationDocument(
      selfie,
      user.id,
      "selfie"
    );

    const verificationRequest = await createVerificationRequest({
      idType,
      idDocumentPath,
      selfiePath,
    });

    return NextResponse.json({ request: verificationRequest }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error submitting verification request:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit verification request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
