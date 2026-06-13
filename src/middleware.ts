import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require authentication (any logged-in user)
  const protectedRoutes = ["/veille", "/profil", "/cours", "/qcm", "/examen-blanc", "/questions"];
  const protectedApiRoutes = ["/api/veille", "/api/quiz-results", "/api/user"];

  // Routes that require admin role
  const adminRoutes = ["/veille"];
  const adminApiRoutes = ["/api/veille/cron", "/api/veille/search", "/api/veille/apply", "/api/veille/analyze"];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));

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

    // Admin-only routes check
    if ((isAdminRoute || isAdminApiRoute) && token.role !== "admin") {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
      }
      // Redirect non-admin users to home
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/veille/:path*", "/api/veille/:path*", "/api/quiz-results/:path*", "/api/user/:path*", "/profil/:path*", "/cours/:path*", "/qcm/:path*", "/examen-blanc/:path*", "/questions/:path*"],
};
