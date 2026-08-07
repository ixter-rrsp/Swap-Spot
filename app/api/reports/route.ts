import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import {
  createReport,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/services/ServerReportService";
import { uploadReportProof } from "@/lib/services/serverStorageServices";

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

    const reportedUserId = formData.get("reportedUserId") as string | null;
    const reason = formData.get("reason") as ReportReason | null;
    const description = (formData.get("description") as string | null) ?? "";
    const files = formData.getAll("proof").filter((f) => f instanceof File) as File[];

    if (!reportedUserId) {
      return NextResponse.json(
        { error: "reportedUserId is required." },
        { status: 400 }
      );
    }

    if (!reason || !REPORT_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "A valid reason is required." },
        { status: 400 }
      );
    }

    if (reason === "other" && !description.trim()) {
      return NextResponse.json(
        { error: "Please describe the issue." },
        { status: 400 }
      );
    }

    // Cap proof uploads to keep this cheap/safe.
    const filesToUpload = files.slice(0, 3);
    const proofUrls: string[] = [];

    for (const file of filesToUpload) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Each screenshot must be under 8MB." },
          { status: 400 }
        );
      }
      const url = await uploadReportProof(file, user.id);
      proofUrls.push(url);
    }

    const report = await createReport({
      reportedUserId,
      reason,
      description,
      proofUrls,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating report:", error);
    const message = error instanceof Error ? error.message : "Failed to submit report.";
    return NextResponse.json({ error: message }, { status: 400 });
  };
  }
