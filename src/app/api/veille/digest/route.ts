import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { NextRequest } from "next/server";
import { extractJsonFromString } from "@/lib/veille";

/**
 * GET /api/veille/digest
 * Génère un résumé hebdomadaire des évolutions détectées :
 * - Nouveaux changements juridiques
 * - Suggestions de questions en attente
 * - Changements gouvernementaux
 * - Recommandations d'action
 */
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Récupérer les données de la semaine
    const [
      newUpdates,
      pendingSuggestions,
      approvedSuggestions,
      rejectedSuggestions,
      governmentChanges,
      recentLogs,
      allUpdates,
    ] = await Promise.all([
      // Changements de la semaine
      db.legalUpdate.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        orderBy: { createdAt: "desc" },
        include: { suggestions: true },
      }),
      // Suggestions en attente
      db.questionSuggestion.findMany({
        where: { status: "pending" },
        include: { legalUpdate: { select: { title: true, category: true } } },
      }),
      // Suggestions approuvées cette semaine
      db.questionSuggestion.count({
        where: { status: "approved", approvedAt: { gte: oneWeekAgo } },
      }),
      // Suggestions rejetées cette semaine
      db.questionSuggestion.count({
        where: { status: "rejected", rejectedAt: { gte: oneWeekAgo } },
      }),
      // Changements gouvernementaux
      db.legalUpdate.findMany({
        where: { category: "gouvernement", createdAt: { gte: oneWeekAgo } },
      }),
      // Logs récents
      db.veilleLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      // Tous les changements (pour stats)
      db.legalUpdate.findMany({
        select: { category: true, impact: true, relevance: true, source: true },
      }),
    ]);

    // Stats par catégorie
    const byCategory: Record<string, number> = {};
    const byImpact: Record<string, number> = {};
    const officialCount = allUpdates.filter(u => u.source.includes(".gouv.fr")).length;

    for (const u of allUpdates) {
      byCategory[u.category] = (byCategory[u.category] || 0) + 1;
      byImpact[u.impact] = (byImpact[u.impact] || 0) + 1;
    }

    // Générer le résumé IA
    const zai = await ZAI.create();
    const digestPrompt = `Tu es un analyste juridique. Résume la veille hebdomadaire de l'examen civique français.

CHANGEMENTS DE LA SEMAINE : ${JSON.stringify(newUpdates.map(u => ({ title: u.title, category: u.category, impact: u.impact, description: u.description })))}
SUGGESTIONS EN ATTENTE : ${pendingSuggestions.length}
GOUVERNEMENT : ${governmentChanges.length} changement(s)
SOURCES OFFICIELLES (.gouv.fr) : ${officialCount}

Génère un résumé structuré en français avec :
1. **Résumé exécutif** (2-3 phrases)
2. **Changements critiques** (impact high/critical)
3. **Actions requises** (suggestions à traiter)
4. **Tendances** (évolutions à surveiller)

Réponds en JSON : { "executiveSummary": "...", "criticalChanges": ["..."], "actionsRequired": ["..."], "trends": ["..."] }`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un analyste juridique français spécialisé en examen civique. Réponds en JSON." },
        { role: "user", content: digestPrompt }
      ],
      temperature: 0.3,
    });

    const aiDigest = extractJsonFromString<{
      executiveSummary: string;
      criticalChanges: string[];
      actionsRequired: string[];
      trends: string[];
    }>(completion.choices[0]?.message?.content || "{}", {
      executiveSummary: "",
      criticalChanges: [],
      actionsRequired: [],
      trends: [],
    });

    // Calculer le score de pertinence
    const relevanceScore = allUpdates.length > 0
      ? Math.round(allUpdates.filter(u => u.relevance === "relevant").length / allUpdates.length * 100)
      : 0;

    return NextResponse.json({
      status: "ok",
      period: {
        from: oneWeekAgo.toISOString(),
        to: new Date().toISOString(),
      },
      summary: {
        newUpdatesThisWeek: newUpdates.length,
        pendingSuggestions: pendingSuggestions.length,
        approvedThisWeek: approvedSuggestions,
        rejectedThisWeek: rejectedSuggestions,
        governmentChanges: governmentChanges.length,
        officialSourcesCount: officialCount,
        relevanceScore,
      },
      byCategory,
      byImpact,
      aiDigest,
      criticalUpdates: newUpdates
        .filter(u => u.impact === "critical" || u.impact === "high")
        .map(u => ({
          id: u.id,
          title: u.title,
          description: u.description,
          category: u.category,
          impact: u.impact,
          source: u.source,
          suggestionsCount: u.suggestions.length,
          createdAt: u.createdAt,
        })),
      pendingSuggestionsList: pendingSuggestions.slice(0, 20).map(s => ({
        id: s.id,
        themeId: s.themeId,
        reason: s.reason,
        status: s.status,
        legalUpdateTitle: s.legalUpdate?.title,
        suggestedData: JSON.parse(s.suggestedData),
      })),
      recentLogs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille digest error:", errorMessage);
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
