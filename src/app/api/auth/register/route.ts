import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sanitizeName, sanitizeEmail, safeParseJSON } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const { data, error: parseError } = await safeParseJSON(req);
    if (parseError || !data) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const { name, email, password } = data as { name: unknown; email: unknown; password: unknown };

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Sanitize name
    const sanitizedName = sanitizeName(name);
    if (!sanitizedName) {
      return NextResponse.json(
        { error: "Le nom est invalide (vide, trop long, ou contient des caractères interdits)" },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Le mot de passe est trop long" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        message: "Compte créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
