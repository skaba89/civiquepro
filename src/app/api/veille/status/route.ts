import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Statut de la veille IA
export async function GET() {
  try {
    // Dernières recherches
    const lastSearch = await prisma.veilleConfig.findUnique({ where: { key: "last_search" } });
    const lastGovUpdate = await prisma.veilleConfig.findUnique({ where: { key: "last_government_update" } });

    // Compteurs
    const [
      totalUpdates,
      pendingSuggestions,
      approvedSuggestions,
      appliedSuggestions,
      totalGovernmentMembers,
      recentLogs,
    ] = await Promise.all([
      prisma.legalUpdate.count(),
      prisma.questionSuggestion.count({ where: { status: "pending" } }),
      prisma.questionSuggestion.count({ where: { status: "approved" } }),
      prisma.questionSuggestion.count({ where: { status: "auto_applied" } }),
      prisma.governmentMember.count({ where: { active: true } }),
      prisma.veilleLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Changements par catégorie
    const updatesByCategory = await prisma.legalUpdate.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    // Changements par impact
    const updatesByImpact = await prisma.legalUpdate.groupBy({
      by: ["impact"],
      _count: { id: true },
    });

    // Derniers changements détectés
    const recentUpdates = await prisma.legalUpdate.findMany({
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
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 }
    );
  }
}
