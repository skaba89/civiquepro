import { NextResponse, NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  buildGovernmentPrompt,
  extractJsonFromString,
  logVeilleAction,
  replaceGovernment,
  upsertVeilleConfig,
  type GovernmentAnalysisResult,
} from "@/lib/veille";

/**
 * POST /api/veille/government
 * Mise à jour des membres du gouvernement via recherche web.
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const startTime = Date.now();

  try {
    const zai = await ZAI.create();

    const searchResult = await zai.functions.invoke("web_search", {
      query: "gouvernement France 2025 2026 composition ministres Premier ministre",
      num: 10,
    });

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert en politique française. Tu réponds uniquement en JSON valide. Tu ne fournis que des informations vérifiées et factuelles." },
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

    const duration = Date.now() - startTime;
    await logVeilleAction({
      action: "government_update",
      status: "completed",
      details: `${parsed.governmentName || "Gouvernement"}: ${savedCount} membres identifiés (changed=${changed})`,
      resultsCount: savedCount,
      duration,
    });
    await upsertVeilleConfig("last_government_update", "Dernière mise à jour gouvernement");

    return NextResponse.json({
      status: "completed",
      governmentName: parsed.governmentName,
      membersFound: savedCount,
      members: parsed.members,
      duration,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Government update error:", errorMessage);
    await logVeilleAction({
      action: "government_update",
      status: "error",
      details: "Erreur interne",
    });
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET: Récupérer les membres actuels du gouvernement
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  try {
    const members = await db.governmentMember.findMany({
      where: { active: true },
      orderBy: [{ role: "asc" }, { ministry: "asc" }],
    });

    return NextResponse.json({
      status: "ok",
      members,
      count: members.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Government GET error:", errorMessage);
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
