import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createClient,
} from "@/utils/supabase/middleware";


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
  ],
};