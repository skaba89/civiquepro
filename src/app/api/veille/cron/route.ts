import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * POST /api/veille/cron
 * Déclenche la veille automatique complète :
 * 1. Recherche web des évolutions juridiques (sources officielles + générales)
 * 2. Mise à jour du gouvernement
 * 3. Vérification des sources officielles (.gouv.fr)
 * 4. Détection des changements du programme d'examen
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth(req);
  if (authError) return authError;

  const startTime = Date.now();
  const results: {
    search?: { changesDetected: number; suggestionsGenerated: number };
    government?: { membersFound: number; governmentName: string; changed: boolean };
    officialSources?: { checked: number; newEntries: number };
    errors: string[];
  } = { errors: [] };

  try {
    const zai = await ZAI.create();

    // ============================================================
    // 1. RECHERCHE WEB - Évolutions juridiques et administratives
    // ============================================================
    try {
      const searchQueries = [
        // Sources législatives officielles
        "site:legifrance.gouv.fr nouvelle loi 2025 2026 examen civique naturalisation",
        "site:legifrance.gouv.fr décret application examen civique QCM 2026",
        "site:legifrance.gouv.fr circulaire naturalisation titre séjour 2025 2026",
        // Sources gouvernementales
        "site:vie-publique.fr nouvelle loi décret 2025 2026 réforme",
        "site:service-public.gouv.fr examen civique titre séjour 2026",
        "site:ofii.fr réforme intégration républicaine examen civique",
        // Veille institutionnelle
        "gouvernement France 2026 remaniement ministres composition",
        "réforme constitutionnelle France 2025 2026 institutions",
        // Veille juridique ciblée
        "arrêté examen civique QCM 2026 programme modifié",
        "réforme droit asile France 2025 2026 circulaire OFPRA",
        "loi immigration intégration républicaine France 2025 2026",
        "jurisprudence Conseil État laïcité droits fondamentaux 2025 2026",
        // Veille pratique
        "préfecture France réforme titre séjour 2026 conditions",
        "OFII formation civique nouveau programme 2025 2026",
        "cycle d'accueil étrangers France réforme 2026",
      ];

      const allResults: Array<{
        query: string;
        results: Array<{ url: string; name: string; snippet: string; date?: string }>;
      }> = [];

      for (const query of searchQueries) {
        try {
          const searchResult = await zai.functions.invoke("web_search", {
            query,
            num: 6,
          });
          allResults.push({
            query,
            results: (searchResult || []).map((r: { url: string; name: string; snippet: string; date?: string }) => ({
              url: r.url,
              name: r.name,
              snippet: r.snippet,
              date: r.date,
            })),
          });
        } catch (err) {
          console.error(`Search failed for "${query}":`, err);
        }
      }

      // Analyse IA approfondie
      const analysisPrompt = `Tu es un expert en droit français et en préparation à l'examen civique français (QCM pour l'obtention du titre de séjour).

Analyse les résultats de recherche web suivants et identifie UNIQUEMENT les changements réels et vérifiés qui auraient un impact sur les questions de l'examen civique français.

Les 5 thématiques de l'examen sont :
1. Principes et valeurs de la République (laïcité, devise, symboles)
2. Droits et devoirs (droits fondamentaux, obligations légales)
3. Histoire, géographie et culture
4. Système institutionnel (institutions, élections, gouvernement)
5. Vivre en société (solidarité, vie quotidienne)

SOURCES OFFICIELLES PRIORITAIRES :
- legifrance.gouv.fr (lois, décrets, circulaires)
- vie-publique.fr (résumés officiels)
- service-public.gouv.fr (fiches pratiques)
- ofii.fr (Office Français de l'Immigration et de l'Intégration)

Pour chaque changement pertinent, fournis :
- title: Titre court
- description: Description détaillée (2-3 phrases)
- source: URL de la source
- category: "loi" | "circulaire" | "decret" | "gouvernement" | "jurisprudence" | "institutionnel" | "administratif"
- impact: "low" | "medium" | "high" | "critical"
- themeId: ID du thème concerné ("principes-valeurs" | "droits-devoirs" | "histoire-geographie" | "systeme-institutionnel" | "vivre-societe")
- officialSource: true si .gouv.fr
- questionSuggestions: suggestions de questions

IMPORTANT : Ne PAS inventer de changements. Ignore les rumeurs.

Résultats :
${JSON.stringify(allResults, null, 2)}

Réponds en JSON :
{
  "changes": [{ "title":"...", "description":"...", "source":"...", "category":"...", "impact":"...", "themeId":"...", "officialSource":true/false, "questionSuggestions":[{ "action":"add", "questionId":null, "suggestedQuestion":{ "text":"...", "options":["..."], "correctAnswer":0, "explanation":"...", "type":"connaissance" }, "reason":"..." }] }],
  "programChanges": { "examFormatChanged":false, "syllabusChanged":false, "passingThresholdChanged":false, "details":"" }
}`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique et l'immigration. Tu réponds uniquement en JSON valide. Tu es très strict sur la vérification des faits." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.15,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{"changes":[],"programChanges":{"examFormatChanged":false,"syllabusChanged":false,"passingThresholdChanged":false,"details":""}}';

      let parsedResponse: {
        changes: Array<{
          title: string;
          description: string;
          source: string;
          category: string;
          impact: string;
          themeId: string;
          officialSource?: boolean;
          questionSuggestions: Array<{
            action: string;
            questionId: string | null;
            suggestedQuestion: {
              text: string;
              options: string[];
              correctAnswer: number;
              explanation: string;
              type: string;
            };
            reason: string;
          }>;
        }>;
        programChanges?: {
          examFormatChanged: boolean;
          syllabusChanged: boolean;
          passingThresholdChanged: boolean;
          details: string;
        };
      };

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { changes: [] };
      } catch {
        parsedResponse = { changes: [] };
      }

      let savedCount = 0;
      for (const change of parsedResponse.changes) {
        // Déduplication par titre + source
        const existing = await db.legalUpdate.findFirst({
          where: { title: change.title, source: change.source }
        });
        if (existing) continue;

        const legalUpdate = await db.legalUpdate.create({
          data: {
            title: change.title,
            description: change.description,
            source: change.source,
            category: change.category,
            impact: change.impact,
            relevance: "relevant",
            status: "analyzed",
            aiAnalysis: JSON.stringify({
              ...change.questionSuggestions,
              officialSource: change.officialSource || false,
            }),
            analyzedAt: new Date(),
          }
        });

        for (const suggestion of change.questionSuggestions) {
          await db.questionSuggestion.create({
            data: {
              legalUpdateId: legalUpdate.id,
              action: suggestion.action,
              themeId: change.themeId,
              questionId: suggestion.questionId,
              suggestedData: JSON.stringify(suggestion.suggestedQuestion),
              reason: suggestion.reason,
              status: change.impact === "critical" ? "auto_applied" : "pending",
              appliedAt: change.impact === "critical" ? new Date() : null,
            }
          });
          savedCount++;
        }
      }

      // Changements du programme
      if (parsedResponse.programChanges && (
        parsedResponse.programChanges.examFormatChanged ||
        parsedResponse.programChanges.syllabusChanged ||
        parsedResponse.programChanges.passingThresholdChanged
      )) {
        const existingProgramChange = await db.legalUpdate.findFirst({
          where: { title: { contains: "Changement du programme" }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        });
        if (!existingProgramChange) {
          await db.legalUpdate.create({
            data: {
              title: "⚠️ Changement du programme de l'examen civique détecté",
              description: parsedResponse.programChanges.details,
              source: "Veille automatique - Analyse multi-sources",
              category: "institutionnel",
              impact: "critical",
              relevance: "relevant",
              status: "analyzed",
              aiAnalysis: JSON.stringify(parsedResponse.programChanges),
              analyzedAt: new Date(),
            }
          });
        }
      }

      results.search = {
        changesDetected: parsedResponse.changes.length,
        suggestionsGenerated: savedCount,
      };

      await db.veilleConfig.upsert({
        where: { key: "last_search" },
        update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
        create: { key: "last_search", value: new Date().toISOString(), description: "Dernière recherche veille IA (cron)" }
      });

    } catch (err) {
      results.errors.push(`Search: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // ============================================================
    // 2. MISE À JOUR GOUVERNEMENT
    // ============================================================
    try {
      const searchResult = await zai.functions.invoke("web_search", {
        query: "gouvernement France 2026 composition ministres Premier ministre remaniement",
        num: 10,
      });

      const prompt = `Tu es un expert en politique française. Identifie TOUS les membres actuels du gouvernement français.

Pour chaque membre : name, role, ministry.

Résultats :
${JSON.stringify(searchResult, null, 2)}

Réponds en JSON : { "members": [{ "name": "...", "role": "...", "ministry": "..." }], "lastUpdated": "...", "governmentName": "..." }`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "Expert politique française. JSON uniquement." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{"members":[],"lastUpdated":"","governmentName":""}';
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { members: [], lastUpdated: "", governmentName: "" };

      const currentActive = await db.governmentMember.count({ where: { active: true } });
      const governmentChanged = parsed.members.length > 0 && parsed.members.length !== currentActive;

      if (governmentChanged) {
        await db.governmentMember.updateMany({
          where: { active: true },
          data: { active: false, endDate: new Date() }
        });

        for (const member of parsed.members) {
          await db.governmentMember.create({
            data: {
              name: member.name,
              role: member.role,
              ministry: member.ministry,
              active: true,
              startDate: new Date(),
              source: parsed.governmentName || "Veille automatique",
            }
          });
        }

        const existingGovUpdate = await db.legalUpdate.findFirst({
          where: { category: "gouvernement", title: { contains: parsed.governmentName || "Gouvernement" } }
        });
        if (!existingGovUpdate) {
          await db.legalUpdate.create({
            data: {
              title: `${parsed.governmentName} - Composition du gouvernement`,
              description: `Veille auto : ${parsed.members.length} membres. ${parsed.lastUpdated}`,
              source: "Veille automatique",
              category: "gouvernement",
              impact: "high",
              relevance: "relevant",
              status: "analyzed",
              aiAnalysis: JSON.stringify({ governmentName: parsed.governmentName, memberCount: parsed.members.length }),
              analyzedAt: new Date(),
            }
          });
        }
      }

      results.government = {
        membersFound: parsed.members.length,
        governmentName: parsed.governmentName || "Inconnu",
        changed: governmentChanged,
      };

      await db.veilleConfig.upsert({
        where: { key: "last_government_update" },
        update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
        create: { key: "last_government_update", value: new Date().toISOString(), description: "Dernière màj gouvernement (cron)" }
      });

    } catch (err) {
      results.errors.push(`Government: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // ============================================================
    // 3. VÉRIFICATION SOURCES OFFICIELLES
    // ============================================================
    try {
      const officialSearches = [
        { query: "site:legifrance.gouv.fr examen civique arrêté 2026", source: "Légifrance" },
        { query: "site:service-public.gouv.fr examen civique titre séjour 2026", source: "Service-Public" },
        { query: "site:ofii.fr intégration républicaine examen 2026", source: "OFII" },
      ];

      let officialEntries = 0;
      for (const search of officialSearches) {
        try {
          const searchResult = await zai.functions.invoke("web_search", { query: search.query, num: 5 });
          if (searchResult && searchResult.length > 0) officialEntries += searchResult.length;
        } catch { /* skip */ }
      }

      results.officialSources = { checked: officialSearches.length, newEntries: officialEntries };
    } catch (err) {
      results.errors.push(`Official: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // ============================================================
    // LOG FINAL
    // ============================================================
    const duration = Date.now() - startTime;
    await db.veilleLog.create({
      data: {
        action: "search",
        status: results.errors.length > 0 ? "completed" : "completed",
        details: `Veille auto: ${results.search?.changesDetected || 0} changements, ${results.government?.membersFound || 0} ministres, ${results.officialSources?.newEntries || 0} sources officielles`,
        resultsCount: (results.search?.suggestionsGenerated || 0) + (results.government?.membersFound || 0),
        duration,
      }
    });

    await db.veilleConfig.upsert({
      where: { key: "last_cron_run" },
      update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
      create: { key: "last_cron_run", value: new Date().toISOString(), description: "Dernière exécution cron" }
    });

    return NextResponse.json({ status: "completed", duration, results, timestamp: new Date().toISOString() });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille cron error:", errorMessage);

    await db.veilleLog.create({
      data: {
        action: "search",
        status: "error",
        details: `Veille auto erreur: ${errorMessage}`,
        duration: Date.now() - startTime,
      }
    });

    return NextResponse.json({ status: "error", message: errorMessage, results }, { status: 500 });
  }
}

// GET: Statut du cron
export async function GET() {
  try {
    const lastCron = await db.veilleConfig.findUnique({ where: { key: "last_cron_run" } });
    const lastSearch = await db.veilleConfig.findUnique({ where: { key: "last_search" } });
    const lastGovUpdate = await db.veilleConfig.findUnique({ where: { key: "last_government_update" } });

    const recentLogs = await db.veilleLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { action: "search" }
    });

    const lastRun = lastCron?.lastCheckedAt;
    const hoursSinceLastRun = lastRun
      ? (Date.now() - lastRun.getTime()) / (1000 * 60 * 60)
      : Infinity;

    return NextResponse.json({
      status: "ok",
      lastCronRun: lastCron?.lastCheckedAt || null,
      lastSearch: lastSearch?.lastCheckedAt || null,
      lastGovernmentUpdate: lastGovUpdate?.lastCheckedAt || null,
      hoursSinceLastRun: Math.round(hoursSinceLastRun * 10) / 10,
      recommendedInterval: 6,
      veilleRecommended: hoursSinceLastRun >= 6,
      recentLogs,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
