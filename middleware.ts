import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/utils/supabase/middleware";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session";


export async function middleware(
  request: NextRequest
) {
  const {
    supabase,
    response,
  } =
    await createClient(request);

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  // --- Hidden admin dashboard gate (hardcoded-credential session, separate
  // from the Supabase auth used above) ---
  const isAdminApiRoute =
    pathname.startsWith("/api/admin-jkiqlou9xs16ceb6gya8Ilve1llt/") &&
    !pathname.startsWith("/api/admin-jkiqlou9xs16ceb6gya8Ilve1llt/login");

  const isAdminDashboardRoute = pathname.startsWith(
    "/admin-jkiqlou9xs16ceb6gya8Ilve1llt/dashboard"
  );

  if (isAdminApiRoute || isAdminDashboardRoute) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const adminUsername = await verifyAdminSessionToken(adminToken);

    if (!adminUsername) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin-jkiqlou9xs16ceb6gya8Ilve1llt";
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const isProtected =
    pathname === "/profile" ||
    pathname.startsWith("/profile/edit") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/requests") ||
    pathname.startsWith("/swap-requests") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/subscriptions") ||
    pathname.startsWith("/my-swaps") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/saved") ||
    (pathname.startsWith("/Listing/") && pathname.endsWith("/edit"));

  if (
    isProtected &&
    !user
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      "/login";

    return NextResponse.redirect(
      loginUrl
    );
  }

  // Hard-suspended accounts are locked out of every authenticated route.
  // (Soft suspension is enforced further down the stack — hidden listings,
  // blocked listing/swap-request inserts — the account itself stays usable.)
  if (isProtected && user && pathname !== "/suspended") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspension_status, suspension_reason")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.suspension_status === "hard") {
      const suspendedUrl = request.nextUrl.clone();
      suspendedUrl.pathname = "/suspended";
      return NextResponse.redirect(suspendedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/profile",
    "/profile/edit/:path*",
    "/post/:path*",
    "/notifications/:path*",
    "/requests/:path*",
    "/swap-requests/:path*",
    "/messages/:path*",
    "/subscriptions/:path*",
    "/my-swaps/:path*",
    "/onboarding/:path*",
    "/saved/:path*",
    "/Listing/:path*/edit",
    "/admin-jkiqlou9xs16ceb6gya8Ilve1llt/dashboard/:path*",
    "/api/admin-jkiqlou9xs16ceb6gya8Ilve1llt/:path*",
  ],
};