import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  EXAM_THEMES,
  THEME_LABELS,
  extractJsonFromString,
  isValidCuid,
  isValidThemeId,
  logVeilleAction,
} from "@/lib/veille";

/**
 * POST /api/veille/analyze
 * Analyse IA d'un changement juridique spécifique et génération de questions QCM.
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const startTime = Date.now();

  try {
    const zai = await ZAI.create();
    const body = await req.json();
    const { legalUpdateId, themeId } = body;

    if (!legalUpdateId || !themeId) {
      return NextResponse.json(
        { status: "error", message: "legalUpdateId et themeId requis" },
        { status: 400 }
      );
    }

    if (!isValidCuid(legalUpdateId)) {
      return NextResponse.json(
        { status: "error", message: "legalUpdateId invalide" },
        { status: 400 }
      );
    }

    if (!isValidThemeId(themeId)) {
      return NextResponse.json(
        { status: "error", message: "themeId invalide" },
        { status: 400 }
      );
    }

    const legalUpdate = await db.legalUpdate.findUnique({ where: { id: legalUpdateId } });
    if (!legalUpdate) {
      return NextResponse.json(
        { status: "error", message: "Changement juridique non trouvé" },
        { status: 404 }
      );
    }

    const prompt = `Tu es un expert en préparation à l'examen civique français. Génère des questions QCM basées sur ce changement juridique récent.

THÉMATIQUE : ${THEME_LABELS[themeId] || themeId}

CHANGEMENT JURIDIQUE :
Titre : ${legalUpdate.title}
Description : ${legalUpdate.description}
Catégorie : ${legalUpdate.category}
Source : ${legalUpdate.source}

Génère entre 1 et 3 questions QCM qui :
1. Sont conformes au format de l'examen civique (4 choix, une seule bonne réponse)
2. Couvrent les aspects pratiques et théoriques du changement
3. Incluent des mises en situation quand c'est pertinent
4. Ont des corrections détaillées qui mentionnent le texte de loi ou la source

Pour chaque question, fournis :
- text: l'intitulé de la question
- options: tableau de 4 propositions
- correctAnswer: index de la bonne réponse (0-3)
- explanation: correction détaillée (3-5 phrases)
- type: "connaissance" ou "mise-en-situation"

Réponds en JSON uniquement :
{
  "questions": [
    {
      "text": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "...",
      "type": "connaissance"
    }
  ],
  "analysis": "Analyse de l'impact de ce changement sur l'examen civique (2-3 phrases)"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique. Tu réponds uniquement en JSON valide." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";
    const parsed = extractJsonFromString<{
      questions: Array<{ text: string; options: string[]; correctAnswer: number; explanation: string; type: string }>;
      analysis: string;
    }>(aiResponse, { questions: [], analysis: "" });

    // Sauvegarder les suggestions
    let savedCount = 0;
    for (const question of parsed.questions) {
      await db.questionSuggestion.create({
        data: {
          legalUpdateId,
          action: "add",
          themeId,
          suggestedData: JSON.stringify(question),
          reason: `Basé sur: ${legalUpdate.title} - ${parsed.analysis}`,
          status: "pending",
        },
      });
      savedCount++;
    }

    await db.legalUpdate.update({
      where: { id: legalUpdateId },
      data: {
        status: "analyzed",
        aiAnalysis: parsed.analysis,
        analyzedAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    await logVeilleAction({
      action: "analyze",
      status: "completed",
      details: `Analyse de "${legalUpdate.title}": ${savedCount} questions générées`,
      resultsCount: savedCount,
      duration,
    });

    return NextResponse.json({
      status: "completed",
      analysis: parsed.analysis,
      questionsGenerated: savedCount,
      questions: parsed.questions,
      duration,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille analyze error:", errorMessage);
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Export des constantes pour réutilisation éventuelle
export { EXAM_THEMES };
