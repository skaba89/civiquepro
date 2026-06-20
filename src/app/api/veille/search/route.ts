import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  SEARCH_QUERIES_LIGHT,
  buildLegalAnalysisPrompt,
  createSseResponse,
  extractJsonFromString,
  logVeilleAction,
  runWebSearches,
  saveLegalChange,
  shouldSkipSearch,
  upsertVeilleConfig,
  type LegalAnalysisResult,
} from "@/lib/veille";

/**
 * POST /api/veille/search
 * Recherche web des dernières évolutions juridiques et gouvernementales
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

  const body = await req.json().catch(() => ({}));
  const forceRefresh = typeof body.forceRefresh === "boolean" ? body.forceRefresh : false;

  // Vérifier si une recherche récente existe (< 6h)
  const { skip, hoursSince, lastChecked } = await shouldSkipSearch(forceRefresh);
  if (skip) {
    return NextResponse.json({
      status: "skipped",
      message: `Dernière recherche il y a ${Math.round(hoursSince || 0)}h. Utilisez forceRefresh pour forcer.`,
      lastChecked,
    });
  }

  // ── Streaming mode ──
  if (isStreaming) {
    return createSseResponse(async (send) => {
      try {
        send("start", { message: "Recherche veille démarrée", timestamp: new Date().toISOString() });
        const zai = await ZAI.create();

        const log = await db.veilleLog.create({
          data: { action: "search", status: "started", details: "Recherche web des évolutions juridiques" },
        });

        const allResults = await runWebSearches(zai, SEARCH_QUERIES_LIGHT, 8, (completed, total) => {
          send("search_progress", { completed, total });
        });

        send("progress", { step: "analysis", message: "Analyse IA en cours..." });

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique. Tu réponds uniquement en JSON valide." },
            { role: "user", content: buildLegalAnalysisPrompt(allResults, false) },
          ],
          temperature: 0.2,
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        const parsedResponse = extractJsonFromString<LegalAnalysisResult>(aiResponse, { changes: [] });

        let savedCount = 0;
        for (const change of parsedResponse.changes) {
          await saveLegalChange(change);
          savedCount += change.questionSuggestions.length;
          send("change_saved", { title: change.title, impact: change.impact });
        }

        await upsertVeilleConfig("last_search", "Dernière recherche veille IA");

        const duration = Date.now() - startTime;
        await db.veilleLog.update({
          where: { id: log.id },
          data: {
            status: "completed",
            details: `${parsedResponse.changes.length} changements détectés, ${savedCount} suggestions de questions`,
            resultsCount: savedCount,
            duration,
          },
        });

        send("complete", {
          status: "completed",
          changesDetected: parsedResponse.changes.length,
          suggestionsGenerated: savedCount,
          duration,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Veille search error:", errorMessage);
        await logVeilleAction({
          action: "search",
          status: "error",
          details: errorMessage,
        });
        send("fatal_error", { message: errorMessage });
      }
    });
  }

  // ── Non-streaming mode ──
  try {
    const zai = await ZAI.create();

    const log = await db.veilleLog.create({
      data: { action: "search", status: "started", details: "Recherche web des évolutions juridiques" },
    });

    const allResults = await runWebSearches(zai, SEARCH_QUERIES_LIGHT, 8);

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique. Tu réponds uniquement en JSON valide." },
        { role: "user", content: buildLegalAnalysisPrompt(allResults, false) },
      ],
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";
    const parsedResponse = extractJsonFromString<LegalAnalysisResult>(aiResponse, { changes: [] });

    let savedCount = 0;
    for (const change of parsedResponse.changes) {
      await saveLegalChange(change);
      savedCount += change.questionSuggestions.length;
    }

    await upsertVeilleConfig("last_search", "Dernière recherche veille IA");

    const duration = Date.now() - startTime;
    await db.veilleLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        details: `${parsedResponse.changes.length} changements détectés, ${savedCount} suggestions de questions`,
        resultsCount: savedCount,
        duration,
      },
    });

    return NextResponse.json({
      status: "completed",
      changesDetected: parsedResponse.changes.length,
      suggestionsGenerated: savedCount,
      duration,
      changes: parsedResponse.changes,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille search error:", errorMessage);
    await logVeilleAction({
      action: "search",
      status: "error",
      details: "Erreur interne",
    });
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
