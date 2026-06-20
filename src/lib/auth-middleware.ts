import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Check if the current request is from an authenticated user.
 * Returns the session if authenticated, or a 401 response if not.
 */
export async function requireAuth(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Check if the current request is from an admin user.
 * Checks the role field from the JWT session.
 */
export async function requireAdmin(req: NextRequest) {
  const result = await requireAuth(req);

  if (result.error) return result;

  if ((result.session?.user as { role?: string })?.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      ),
    };
  }

  return result;
}
