import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeName, safeParseJSON } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data, error: parseError } = await safeParseJSON(request);
    if (parseError || !data) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const { name } = data as { name: unknown };

    // Sanitize and validate name
    const sanitizedName = sanitizeName(name);
    if (!sanitizedName) {
      return NextResponse.json(
        { error: "Le nom est invalide (vide, trop long, ou contient des caractères interdits)" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { email: session.user.email },
      data: { name: sanitizedName },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Also support PUT method (API contract compliance)
export async function PUT(request: Request) {
  return POST(request);
}
