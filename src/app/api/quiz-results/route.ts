import { NextResponse } from "next/server";
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
