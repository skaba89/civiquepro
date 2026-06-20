import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  CRON_SEARCH_QUERIES,
  OFFICIAL_SOURCE_SEARCHES,
  buildLegalAnalysisPrompt,
  buildGovernmentPrompt,
  createSseResponse,
  extractJsonFromString,
  logVeilleAction,
  replaceGovernment,
  runWebSearches,
  saveLegalChange,
  saveProgramChangeIfNeeded,
  upsertVeilleConfig,
  type LegalAnalysisResult,
  type GovernmentAnalysisResult,
} from "@/lib/veille";

/**
 * POST /api/veille/cron
 * Déclenche la veille automatique complète :
 * 1. Recherche web des évolutions juridiques
 * 2. Mise à jour du gouvernement
 * 3. Vérification des sources officielles
 *
 * Supports streaming mode for serverless environments:
 * - Add ?stream=true to get Server-Sent Events (keeps connection alive)
 * - Without stream, returns complete JSON response (may timeout on serverless)
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const isStreaming = req.nextUrl.searchParams.get("stream") === "true";
  const startTime = Date.now();
  const results: {
    search?: { changesDetected: number; suggestionsGenerated: number };
    government?: { membersFound: number; governmentName: string; changed: boolean };
    officialSources?: { checked: number; newEntries: number };
    errors: string[];
  } = { errors: [] };

  // ── Streaming mode ──
  if (isStreaming) {
    return createSseResponse(async (send) => {
      try {
        send("start", { message: "Veille automatique démarrée", timestamp: new Date().toISOString() });
        const zai = await ZAI.create();

        // ── Step 1: Web Search ──
        send("progress", { step: 1, total: 3, message: "Recherche des évolutions juridiques..." });
        try {
          const allResults = await runWebSearches(zai, CRON_SEARCH_QUERIES, 6, (completed, total) => {
            send("search_progress", { completed, total });
          });

          send("progress", { step: 1, total: 3, message: "Analyse IA en cours..." });

          const completion = await zai.chat.completions.create({
            messages: [
              { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique et l'immigration. Tu réponds uniquement en JSON valide. Tu es très strict sur la vérification des faits." },
              { role: "user", content: buildLegalAnalysisPrompt(allResults, true) },
            ],
            temperature: 0.15,
          });

          const aiResponse = completion.choices[0]?.message?.content || "{}";
          const parsedResponse = extractJsonFromString<LegalAnalysisResult>(aiResponse, { changes: [] });

          let savedCount = 0;
          for (const change of parsedResponse.changes) {
            const { savedSuggestions } = await saveLegalChange(change, { skipDuplicates: true });
            savedCount += savedSuggestions;
            send("change_saved", { title: change.title, impact: change.impact });
          }

          if (parsedResponse.programChanges) {
            await saveProgramChangeIfNeeded(parsedResponse.programChanges);
          }

          results.search = {
            changesDetected: parsedResponse.changes.length,
            suggestionsGenerated: savedCount,
          };

          await upsertVeilleConfig("last_search", "Dernière recherche veille IA (cron)");
        } catch (err) {
          results.errors.push(`Search: ${err instanceof Error ? err.message : "Unknown error"}`);
          send("error", { step: "search", message: results.errors[results.errors.length - 1] });
        }

        // ── Step 2: Government Update ──
        send("progress", { step: 2, total: 3, message: "Mise à jour du gouvernement..." });
        try {
          const searchResult = await zai.functions.invoke("web_search", {
            query: "gouvernement France 2026 composition ministres Premier ministre remaniement",
            num: 10,
          });

          const completion = await zai.chat.completions.create({
            messages: [
              { role: "system", content: "Expert politique française. JSON uniquement." },
              { role: "user", content: buildGovernmentPrompt(searchResult) },
            ],
            temperature: 0.1,
          });

          const aiResponse = completion.choices[0]?.message?.content || "{}";
          const parsed = extractJsonFromString<GovernmentAnalysisResult>(aiResponse, {
            members: [],
            lastUpdated: "",
            governmentName: "",
          });

          const { changed, savedCount } = await replaceGovernment(parsed);

          results.government = {
            membersFound: savedCount,
            governmentName: parsed.governmentName || "Inconnu",
            changed,
          };

          await upsertVeilleConfig("last_government_update", "Dernière màj gouvernement (cron)");
        } catch (err) {
          results.errors.push(`Government: ${err instanceof Error ? err.message : "Unknown error"}`);
          send("error", { step: "government", message: results.errors[results.errors.length - 1] });
        }

        // ── Step 3: Official Sources ──
        send("progress", { step: 3, total: 3, message: "Vérification des sources officielles..." });
        try {
          let officialEntries = 0;
          for (const search of OFFICIAL_SOURCE_SEARCHES) {
            try {
              const searchResult = await zai.functions.invoke("web_search", { query: search.query, num: 5 });
              if (searchResult && searchResult.length > 0) officialEntries += searchResult.length;
            } catch { /* skip */ }
          }
          results.officialSources = { checked: OFFICIAL_SOURCE_SEARCHES.length, newEntries: officialEntries };
        } catch (err) {
          results.errors.push(`Official: ${err instanceof Error ? err.message : "Unknown error"}`);
        }

        // ── Final Log ──
        const duration = Date.now() - startTime;
        await logVeilleAction({
          action: "search",
          status: "completed",
          details: `Veille auto: ${results.search?.changesDetected || 0} changements, ${results.government?.membersFound || 0} ministres, ${results.officialSources?.newEntries || 0} sources officielles`,
          resultsCount: (results.search?.suggestionsGenerated || 0) + (results.government?.membersFound || 0),
          duration,
        });
        await upsertVeilleConfig("last_cron_run", "Dernière exécution cron");

        send("complete", { duration, results, timestamp: new Date().toISOString() });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Veille cron error:", errorMessage);
        await logVeilleAction({
          action: "search",
          status: "error",
          details: `Veille auto erreur: ${errorMessage}`,
          duration: Date.now() - startTime,
        });
        send("fatal_error", { message: errorMessage });
      }
    });
  }

  // ── Non-streaming mode ──
  try {
    const zai = await ZAI.create();

    // 1. RECHERCHE WEB
    try {
      const allResults = await runWebSearches(zai, CRON_SEARCH_QUERIES, 6);

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique et l'immigration. Tu réponds uniquement en JSON valide. Tu es très strict sur la vérification des faits." },
          { role: "user", content: buildLegalAnalysisPrompt(allResults, true) },
        ],
        temperature: 0.15,
      });

      const aiResponse = completion.choices[0]?.message?.content || "{}";
      const parsedResponse = extractJsonFromString<LegalAnalysisResult>(aiResponse, { changes: [] });

      let savedCount = 0;
      for (const change of parsedResponse.changes) {
        const { savedSuggestions } = await saveLegalChange(change, { skipDuplicates: true });
        savedCount += savedSuggestions;
      }

      if (parsedResponse.programChanges) {
        await saveProgramChangeIfNeeded(parsedResponse.programChanges);
      }

      results.search = {
        changesDetected: parsedResponse.changes.length,
        suggestionsGenerated: savedCount,
      };
      await upsertVeilleConfig("last_search", "Dernière recherche veille IA (cron)");
    } catch (err) {
      results.errors.push(`Search: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    // 2. MISE À JOUR GOUVERNEMENT
    try {
      const searchResult = await zai.functions.invoke("web_search", {
        query: "gouvernement France 2026 composition ministres Premier ministre remaniement",
        num: 10,
      });

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "Expert politique française. JSON uniquement." },
          { role: "user", content: buildGovernmentPrompt(searchResult) },
        ],
        temperature: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content || "{}";
      const parsed = extractJsonFromString<GovernmentAnalysisResult>(aiResponse, {
        members: [],
        lastUpdated: "",
        governmentName: "",
      });

      const { changed, savedCount } = await replaceGovernment(parsed);

      results.government = {
        membersFound: savedCount,
        governmentName: parsed.governmentName || "Inconnu",
        changed,
      };
      await upsertVeilleConfig("last_government_update", "Dernière màj gouvernement (cron)");
    } catch (err) {
      results.errors.push(`Government: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    // 3. VÉRIFICATION SOURCES OFFICIELLES
    try {
      let officialEntries = 0;
      for (const search of OFFICIAL_SOURCE_SEARCHES) {
        try {
          const searchResult = await zai.functions.invoke("web_search", { query: search.query, num: 5 });
          if (searchResult && searchResult.length > 0) officialEntries += searchResult.length;
        } catch { /* skip */ }
      }
      results.officialSources = { checked: OFFICIAL_SOURCE_SEARCHES.length, newEntries: officialEntries };
    } catch (err) {
      results.errors.push(`Official: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    // LOG FINAL
    const duration = Date.now() - startTime;
    await logVeilleAction({
      action: "search",
      status: "completed",
      details: `Veille auto: ${results.search?.changesDetected || 0} changements, ${results.government?.membersFound || 0} ministres, ${results.officialSources?.newEntries || 0} sources officielles`,
      resultsCount: (results.search?.suggestionsGenerated || 0) + (results.government?.membersFound || 0),
      duration,
    });
    await upsertVeilleConfig("last_cron_run", "Dernière exécution cron");

    return NextResponse.json({ status: "completed", duration, results, timestamp: new Date().toISOString() });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille cron error:", errorMessage);
    await logVeilleAction({
      action: "search",
      status: "error",
      details: `Veille auto erreur: ${errorMessage}`,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur", results: { errors: results.errors } },
      { status: 500 }
    );
  }
}

// GET: Statut du cron
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  try {
    const lastCron = await db.veilleConfig.findUnique({ where: { key: "last_cron_run" } });
    const lastSearch = await db.veilleConfig.findUnique({ where: { key: "last_search" } });
    const lastGovUpdate = await db.veilleConfig.findUnique({ where: { key: "last_government_update" } });

    const recentLogs = await db.veilleLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { action: "search" },
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
    console.error("Veille cron GET error:", error instanceof Error ? error.message : "Erreur inconnue");
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
