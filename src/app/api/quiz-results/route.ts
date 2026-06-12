import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeParseJSON } from "@/lib/sanitize";

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

    const { data, error: parseError } = await safeParseJSON(request);
    if (parseError || !data) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const { quizType, themeId, serieId, totalQuestions, correctAnswers, score, passed, timeUsed, answers } = data as Record<string, unknown>;

    // Validate required fields
    if (!quizType || totalQuestions === undefined || correctAnswers === undefined ||
        score === undefined || passed === undefined || timeUsed === undefined) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Validate quizType
    const validTypes = ["qcm", "examen-blanc", "theme"];
    if (!validTypes.includes(quizType as string)) {
      return NextResponse.json({ error: "Type de quiz invalide" }, { status: 400 });
    }

    // Validate numeric fields
    const numTotal = Number(totalQuestions);
    const numCorrect = Number(correctAnswers);
    const numScore = Number(score);
    const numTime = Number(timeUsed);

    if (isNaN(numTotal) || isNaN(numCorrect) || isNaN(numScore) || isNaN(numTime)) {
      return NextResponse.json({ error: "Les champs numériques doivent être des nombres valides" }, { status: 400 });
    }

    // Validate score range
    if (numScore < 0 || numScore > 100) {
      return NextResponse.json({ error: "Score invalide (0-100)" }, { status: 400 });
    }

    // Validate totalQuestions > 0
    if (numTotal <= 0) {
      return NextResponse.json({ error: "Le nombre total de questions doit être positif" }, { status: 400 });
    }

    // Validate correctAnswers range
    if (numCorrect < 0 || numCorrect > numTotal) {
      return NextResponse.json({ error: "Le nombre de réponses correctes doit être entre 0 et le nombre total de questions" }, { status: 400 });
    }

    // Validate timeUsed >= 0
    if (numTime < 0) {
      return NextResponse.json({ error: "Le temps utilisé ne peut pas être négatif" }, { status: 400 });
    }

    // Cap timeUsed at reasonable maximum (8 hours = 28800 seconds)
    const cappedTime = Math.min(numTime, 28800);

    const result = await db.quizResult.create({
      data: {
        userId: user.id,
        quizType: quizType as string,
        themeId: (themeId as string) || null,
        serieId: (serieId as string) || null,
        totalQuestions: numTotal,
        correctAnswers: numCorrect,
        score: numScore,
        passed: passed as boolean,
        timeUsed: cappedTime,
        answers: typeof answers === "string" ? answers : JSON.stringify(answers || {}),
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
