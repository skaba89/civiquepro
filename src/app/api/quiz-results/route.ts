import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const results = await db.quizResult.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({
      results: results.map((r) => ({
        id: r.id,
        quizType: r.quizType,
        themeId: r.themeId,
        serieId: r.serieId,
        totalQuestions: r.totalQuestions,
        correctAnswers: r.correctAnswers,
        score: r.score,
        passed: r.passed,
        timeUsed: r.timeUsed,
        completedAt: r.completedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { quizType, themeId, serieId, totalQuestions, correctAnswers, score, passed, timeUsed, answers } = body;

    // Validate required fields
    if (!quizType || totalQuestions === undefined || correctAnswers === undefined || 
        score === undefined || passed === undefined || timeUsed === undefined) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Validate quizType
    const validTypes = ["qcm", "examen-blanc", "theme"];
    if (!validTypes.includes(quizType)) {
      return NextResponse.json({ error: "Type de quiz invalide" }, { status: 400 });
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return NextResponse.json({ error: "Score invalide" }, { status: 400 });
    }

    const result = await db.quizResult.create({
      data: {
        userId: user.id,
        quizType,
        themeId: themeId || null,
        serieId: serieId || null,
        totalQuestions,
        correctAnswers,
        score,
        passed,
        timeUsed,
        answers: typeof answers === "string" ? answers : JSON.stringify(answers || {}),
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
