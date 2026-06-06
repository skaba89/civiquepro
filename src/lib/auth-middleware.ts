import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Check if the current request is from an authenticated user.
 * Returns the session if authenticated, or a 401 response if not.
 */
export async function requireAuth(req: NextRequest) {
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
 * For now, any authenticated user is considered admin.
 * In production, add a `role` field to the User model.
 */
export async function requireAdmin(req: NextRequest) {
  const result = await requireAuth(req);

  if (result.error) return result;

  // TODO: Check user.role === "admin" when role field is added
  // For now, all authenticated users can access admin features
  return result;
}
