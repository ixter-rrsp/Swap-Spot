import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getIpAddress, parseUserAgent } from "@/lib/utils/deviceInfo";
import { loginSchema } from "@/lib/validations/LoginSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprintHash, ...credentials } = body;

    // 1. Validate Form Data
    const parseResult = loginSchema.safeParse(credentials);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid email or password format.",
          issues: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const supabase = await createClient();

    // 2. Sign In with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json({ error: "User authentication failed." }, { status: 401 });
    }

    // 3. Enforce Verified Email Before Login
    const isEmailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
    if (!isEmailVerified) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Please verify your email address before logging in." },
        { status: 403 }
      );
    }

    // 4. Multi-Device Registration Logic on Successful Login
    const supabaseAdmin = createServiceClient() || supabase;
    const ipAddress = getIpAddress(request);
    const userAgent = request.headers.get("user-agent");
    const { browser, os } = parseUserAgent(userAgent);
    const now = new Date().toISOString();

    const normalizedHash =
      typeof fingerprintHash === "string" && /^[a-f0-9]{64}$/i.test(fingerprintHash.trim())
        ? fingerprintHash.trim().toLowerCase()
        : null;

    if (normalizedHash) {
      // Check if this fingerprint_hash is already registered in the DB
      const { data: existingReg } = await supabaseAdmin
        .from("device_registrations")
        .select("id, user_id")
        .eq("fingerprint_hash", normalizedHash)
        .maybeSingle();

      if (existingReg) {
        if (existingReg.user_id === user.id) {
          // Case A: Device belongs to this user -> Update last_seen_at & environment metadata
          await supabaseAdmin
            .from("device_registrations")
            .update({
              last_seen_at: now,
              ip_address: ipAddress,
              browser,
              os,
            })
            .eq("id", existingReg.id);
        } else {
          // Case C: Device belongs to a DIFFERENT user -> Skip registration & log event, DO NOT block login
          console.warn(
            `[Device Abuse Guard] User ${user.id} logged in from device ${normalizedHash} registered to user ${existingReg.user_id}. Skipping device registration.`
          );
        }
      } else {
        // Case B: Device is NEW (unseen) -> Register as a new device for this user
        const { error: insertErr } = await supabaseAdmin.from("device_registrations").insert({
          user_id: user.id,
          fingerprint_hash: normalizedHash,
          browser,
          os,
          ip_address: ipAddress,
          created_at: now,
          last_seen_at: now,
        });

        if (insertErr) {
          // Gracefully catch potential UNIQUE constraint race condition without failing login
          console.warn(
            `[Device Abuse Guard] Gracefully caught insert error during login device registration: ${insertErr.message}`
          );
        }
      }
    }

    return NextResponse.json({
      message: "Login successful.",
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred during login." },
      { status: 500 }
    );
  }
}
