import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Called periodically by any signed-in client (see usePresenceHeartbeat)
// to stamp profiles.last_seen_at — this is what "Active now" / "Active
// 5m ago" in the chat header is computed from.
export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not logged in — nothing to stamp, not an error.
    if (!user) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PRESENCE HEARTBEAT ERROR:", error);
    // Presence is best-effort — never surface this as a hard failure.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
