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
    data:{
      user,
    },
  } =
    await supabase.auth.getUser();


  const pathname =
    request.nextUrl.pathname;


  const protectedRoutes = [
    "/profile",
    "/profile/edit",
    "/post-listing",
    "/notifications",
    "/requests",
  ];


  const isProtected =
    protectedRoutes.some(
      (route) =>
        pathname.startsWith(route)
    );


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
    "/profile/:path*",
    "/post-listing/:path*",
    "/notifications/:path*",
    "/requests/:path*",
    "/api/:path*",
  ],
};