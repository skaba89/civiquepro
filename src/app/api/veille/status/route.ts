import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";


// Statut de la veille IA
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    // Dernières recherches
    const lastSearch = await db.veilleConfig.findUnique({ where: { key: "last_search" } });
    const lastGovUpdate = await db.veilleConfig.findUnique({ where: { key: "last_government_update" } });

    // Compteurs
    const [
      totalUpdates,
      pendingSuggestions,
      approvedSuggestions,
      appliedSuggestions,
      totalGovernmentMembers,
      recentLogs,
    ] = await Promise.all([
      db.legalUpdate.count(),
      db.questionSuggestion.count({ where: { status: "pending" } }),
      db.questionSuggestion.count({ where: { status: "approved" } }),
      db.questionSuggestion.count({ where: { status: "auto_applied" } }),
      db.governmentMember.count({ where: { active: true } }),
      db.veilleLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Changements par catégorie
    const updatesByCategory = await db.legalUpdate.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    // Changements par impact
    const updatesByImpact = await db.legalUpdate.groupBy({
      by: ["impact"],
      _count: { id: true },
    });

    // Derniers changements détectés
    const recentUpdates = await db.legalUpdate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        suggestions: {
          where: { status: "pending" },
          take: 3,
        }
      }
    });

    return NextResponse.json({
      status: "ok",
      lastSearch: lastSearch?.lastCheckedAt || null,
      lastGovernmentUpdate: lastGovUpdate?.lastCheckedAt || null,
      stats: {
        totalUpdates,
        pendingSuggestions,
        approvedSuggestions,
        appliedSuggestions,
        totalGovernmentMembers,
      },
      updatesByCategory: updatesByCategory.map(u => ({ category: u.category, count: u._count.id })),
      updatesByImpact: updatesByImpact.map(u => ({ impact: u.impact, count: u._count.id })),
      recentUpdates,
      recentLogs,
    });
  } catch (error: unknown) {
    console.error("Veille status error:", error instanceof Error ? error.message : "Erreur inconnue");
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
