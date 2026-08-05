import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/utils/supabase/service";
import { getIpAddress, parseUserAgent } from "@/lib/utils/deviceInfo";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const deviceFpParam = requestUrl.searchParams.get("device_fp");
  const cookieStore = await cookies();
  const deviceFpCookie = cookieStore.get("sb-device-fp")?.value;

  const rawDeviceFp = deviceFpParam || deviceFpCookie || "";
  const normalizedHash =
    typeof rawDeviceFp === "string" && /^[a-f0-9]{64}$/i.test(rawDeviceFp.trim())
      ? rawDeviceFp.trim().toLowerCase()
      : null;

  // Figure out the public-facing origin
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${error?.code ?? "auth_error"}&error_description=${encodeURIComponent(
        error?.message ?? "Authentication failed."
      )}`
    );
  }

  const user = data.user;
  const supabaseAdmin = createServiceClient() || supabase;
  const ipAddress = getIpAddress(request);
  const userAgent = request.headers.get("user-agent");
  const { browser, os } = parseUserAgent(userAgent);
  const now = new Date().toISOString();

  // Check if user has existing device registrations
  const { data: userDeviceRegs } = await supabaseAdmin
    .from("device_registrations")
    .select("id")
    .eq("user_id", user.id);

  const isNewOAuthUser = !userDeviceRegs || userDeviceRegs.length === 0;

  // If Supabase just created a brand-new auth user for this Google
  // sign-in, check whether an OLDER account already exists with the same
  // email. This happens when someone originally signed up with
  // email/password but never verified that email — Supabase's automatic
  // identity linking only links to a VERIFIED email, so instead of
  // recognizing them, it silently creates a second, separate account.
  // Catch that here rather than letting the user end up with two
  // accounts and no idea why their data "disappeared."
  if (isNewOAuthUser && user.email && supabaseAdmin.auth.admin) {
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
      });

      const duplicateAccount = userList?.users?.find(
        (candidate) =>
          candidate.id !== user.id &&
          candidate.email?.toLowerCase() === user.email!.toLowerCase()
      );

      if (duplicateAccount) {
        // Clean up the duplicate we just accidentally created, then sign
        // this session out — don't leave an orphaned Google-only account
        // sitting around with no way for the user to reach it again.
        try {
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        } catch (delErr) {
          console.error(
            "[OAuth Duplicate Guard] Error deleting duplicate user:",
            delErr
          );
        }
        await supabase.auth.signOut();

        const response = NextResponse.redirect(
          `${origin}/login?error=duplicate_email&error_description=${encodeURIComponent(
            "An account with this email already exists. Please log in with your email and password, then link Google from your profile settings."
          )}`
        );
        response.cookies.delete("sb-device-fp");
        return response;
      }
    } catch (lookupErr) {
      // If the lookup itself fails, fail open rather than blocking
      // legitimate sign-ins — worst case we're back to the original
      // (rare) duplicate-account behavior, not a broken login flow.
      console.error("[OAuth Duplicate Guard] Lookup failed:", lookupErr);
    }
  }

  if (normalizedHash) {
    const { data: existingHashReg } = await supabaseAdmin
      .from("device_registrations")
      .select("id, user_id")
      .eq("fingerprint_hash", normalizedHash)
      .maybeSingle();

    if (isNewOAuthUser) {
      // 1. NEW OAUTH SIGNUP: Device abuse check
      if (existingHashReg && existingHashReg.user_id !== user.id) {
        // Device ALREADY belongs to another user -> Delete newly created auth user & logout
        if (supabaseAdmin.auth.admin) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
          } catch (delErr) {
            console.error("[OAuth Device Guard] Error deleting user:", delErr);
          }
        }
        await supabase.auth.signOut();

        const response = NextResponse.redirect(
          `${origin}/login?error=device_already_registered&error_description=${encodeURIComponent(
            "This device is already associated with an existing account. Only one account per device is permitted."
          )}`
        );
        response.cookies.delete("sb-device-fp");
        return response;
      }

      // Unique device -> Register device for new OAuth user
      await supabaseAdmin.from("device_registrations").insert({
        user_id: user.id,
        fingerprint_hash: normalizedHash,
        browser,
        os,
        ip_address: ipAddress,
        created_at: now,
        last_seen_at: now,
      });
    } else {
      // 2. EXISTING GOOGLE OAUTH USER LOGGING IN: Multi-device logic
      if (existingHashReg) {
        if (existingHashReg.user_id === user.id) {
          await supabaseAdmin
            .from("device_registrations")
            .update({
              last_seen_at: now,
              ip_address: ipAddress,
              browser,
              os,
            })
            .eq("id", existingHashReg.id);
        } else {
          console.warn(
            `[OAuth Multi-Device Guard] User ${user.id} logged in from device ${normalizedHash} owned by ${existingHashReg.user_id}. Skipping device registration.`
          );
        }
      } else {
        // New device for existing OAuth user -> Register device
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
          console.warn(`[OAuth Multi-Device Guard] Caught insert error: ${insertErr.message}`);
        }
      }
    }
  }

  // New OAuth users go to onboarding for the optional location prompt.
  // Returning users go directly to home.
  const destination = isNewOAuthUser ? `${origin}/onboarding` : `${origin}/home`;
  const response = NextResponse.redirect(destination);
  response.cookies.delete("sb-device-fp");
  return response;
}