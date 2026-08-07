import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";
import { getIpAddress, parseUserAgent, verifyTurnstileToken } from "@/lib/utils/deviceInfo";
import { signupSchema } from "@/lib/validations/SignupSchema";

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  const supabaseAdmin = createServiceClient() || (await createClient());

  try {
    const body = await request.json();
    const { fingerprintHash, turnstileToken, ...formData } = body;

    // 1. Validate Form Input
    const parseResult = signupSchema.safeParse(formData);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data.",
          issues: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, username, dateOfBirth } = parseResult.data;
    const ipAddress = getIpAddress(request);
    const userAgent = request.headers.get("user-agent");
    const { browser, os } = parseUserAgent(userAgent);

    // 2. Validate Fingerprint Format (Must be 64-char lowercase hex SHA-256)
    const normalizedHash =
      typeof fingerprintHash === "string" ? fingerprintHash.trim().toLowerCase() : "";

    if (!/^[a-f0-9]{64}$/.test(normalizedHash)) {
      return NextResponse.json(
        { error: "Device fingerprint verification failed. Invalid fingerprint hash format." },
        { status: 400 }
      );
    }

    // 3. Signup Rate Limiting (Per IP - BEFORE Turnstile & User Creation)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: ipAttemptCount, error: rateLimitErr } = await supabaseAdmin
      .from("signup_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .gte("created_at", oneHourAgo);

    if (!rateLimitErr && ipAttemptCount !== null && ipAttemptCount >= 5) {
      return NextResponse.json(
        { error: "Too many signup attempts from this IP address. Please try again later." },
        { status: 429 }
      );
    }

    await supabaseAdmin.from("signup_rate_limits").insert({ ip_address: ipAddress });

    // 4. Username Uniqueness Check
    const { data: existingUsername } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose a different one." },
        { status: 400 }
      );
    }

    // 5. Backend Device Hash Uniqueness Check (BEFORE Turnstile & User Creation)
    const { data: existingDevice } = await supabaseAdmin
      .from("device_registrations")
      .select("id")
      .eq("fingerprint_hash", normalizedHash)
      .maybeSingle();

    if (existingDevice) {
      return NextResponse.json(
        { error: "This device is already associated with an existing account. Only one account per device is permitted." },
        { status: 400 }
      );
    }

    // 6. Turnstile Verification (Server-Side - BEFORE User Creation)
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, ipAddress);
    if (!isTurnstileValid) {
      return NextResponse.json(
        { error: "Cloudflare Turnstile verification failed. Please try again." },
        { status: 400 }
      );
    }

    // 7. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          date_of_birth: dateOfBirth,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: (authError as Error).message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    createdUserId = authData.user.id;

    // 8. Record Device Registration - Rollback on Failure
    const { error: regError } = await supabaseAdmin.from("device_registrations").insert({
      user_id: createdUserId,
      fingerprint_hash: normalizedHash,
      browser,
      os,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    });

    if (regError) {
      console.error("Device registration failed, rolling back user creation:", regError);
      if (supabaseAdmin.auth.admin && createdUserId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(createdUserId);
        } catch (rollbackErr) {
          console.error("Failed to delete user during rollback:", rollbackErr);
        }
      }
      return NextResponse.json(
        { error: "This device is already associated with an existing account." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Account created successfully! Please check your email to verify your account.",
      user: authData.user,
    });
  } catch (error) {
    console.error("Signup API error:", error);
    if (createdUserId && supabaseAdmin?.auth?.admin) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      } catch (rollbackErr) {
        console.error("Failed to delete user during rollback:", rollbackErr);
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred during signup." },
      { status: 500 }
    );
  }
}

