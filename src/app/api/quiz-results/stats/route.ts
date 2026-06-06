import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/quiz-results/stats - Get current user's aggregated stats
export async function GET() {
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

    const results = await db.quizResult.findMany({
      where: { userId: user.id },
    });

    const totalQuizzes = results.length;
    const avgScore = totalQuizzes > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalQuizzes) : 0;
    const bestScore = totalQuizzes > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const passedCount = results.filter(r => r.passed).length;
    const totalTime = results.reduce((acc, r) => acc + r.timeUsed, 0);
    const passRate = totalQuizzes > 0 ? Math.round((passedCount / totalQuizzes) * 100) : 0;

    // Stats by quiz type
    const byType: Record<string, { count: number; avgScore: number; passRate: number }> = {};
    for (const r of results) {
      if (!byType[r.quizType]) {
        byType[r.quizType] = { count: 0, avgScore: 0, passRate: 0 };
      }
      byType[r.quizType].count++;
    }
    for (const type of Object.keys(byType)) {
      const typeResults = results.filter(r => r.quizType === type);
      byType[type].avgScore = Math.round(typeResults.reduce((acc, r) => acc + r.score, 0) / typeResults.length);
      byType[type].passRate = Math.round((typeResults.filter(r => r.passed).length / typeResults.length) * 100);
    }

    // Stats by theme
    const byTheme: Record<string, { count: number; avgScore: number; passRate: number }> = {};
    for (const r of results.filter(r => r.themeId)) {
      if (!byTheme[r.themeId!]) {
        byTheme[r.themeId!] = { count: 0, avgScore: 0, passRate: 0 };
      }
      byTheme[r.themeId!].count++;
    }
    for (const themeId of Object.keys(byTheme)) {
      const themeResults = results.filter(r => r.themeId === themeId);
      byTheme[themeId].avgScore = Math.round(themeResults.reduce((acc, r) => acc + r.score, 0) / themeResults.length);
      byTheme[themeId].passRate = Math.round((themeResults.filter(r => r.passed).length / themeResults.length) * 100);
    }

    return NextResponse.json({
      totalQuizzes,
      avgScore,
      bestScore,
      passedCount,
      totalTime,
      passRate,
      byType,
      byTheme,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
