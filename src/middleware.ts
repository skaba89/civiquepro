import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware d'autorisation.
 *
 * Routes publiques (accès sans connexion) :
 *  - /, /login, /register, /ressources
 *  - /qcm, /qcm/theme/[themeId]  (listes et fiches thématiques)
 *  - /cours, /annales, /questions (contenu pédagogique)
 *  - /examen-blanc (page de présentation)
 *
 * Routes protégées (utilisateur connecté) :
 *  - /profil
 *  - /qcm/quiz/*, /examen-blanc/quiz (les quiz interactifs qui sauvegardent des résultats)
 *
 * Routes admin uniquement :
 *  - /veille
 *  - /api/veille/*
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes utilisateur connecté (pattern exact ou sous-chemin)
  const protectedUserRoutes = ["/profil", "/qcm/quiz", "/examen-blanc/quiz"];
  const protectedApiRoutes = ["/api/veille", "/api/quiz-results", "/api/user"];

  // Routes admin uniquement
  const adminRoutes = ["/veille"];
  const adminApiRoutes = [
    "/api/veille/cron",
    "/api/veille/search",
    "/api/veille/apply",
    "/api/veille/analyze",
    "/api/veille/government",
    "/api/veille/status",
    "/api/veille/digest",
  ];

  const isProtectedUserRoute = protectedUserRoutes.some(
    route => pathname === route || pathname.startsWith(route + "/")
  );
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedUserRoute || isProtectedApiRoute || isAdminRoute || isAdminApiRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (isProtectedApiRoute || isAdminApiRoute) {
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
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin
    "/veille/:path*",
    "/api/veille/:path*",
    // User-protected
    "/profil/:path*",
    "/qcm/quiz/:path*",
    "/examen-blanc/quiz/:path*",
    "/api/quiz-results/:path*",
    "/api/user/:path*",
  ],
};
