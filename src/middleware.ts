import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ["/veille", "/profil", "/cours", "/qcm", "/examen-blanc", "/questions"];
  const protectedApiRoutes = ["/api/veille", "/api/quiz-results", "/api/user"];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isProtectedApiRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/veille/:path*", "/api/veille/:path*", "/api/quiz-results/:path*", "/api/user/:path*", "/profil/:path*", "/cours/:path*", "/qcm/:path*", "/examen-blanc/:path*", "/questions/:path*"],
};
