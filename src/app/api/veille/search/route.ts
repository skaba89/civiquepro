import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Recherche web des dernières évolutions juridiques et gouvernementales
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const zai = await ZAI.create();
    const body = await req.json().catch(() => ({}));
    const forceRefresh = body.forceRefresh || false;

    // Vérifier si une recherche récente existe (< 6h)
    if (!forceRefresh) {
      const lastCheck = await prisma.veilleConfig.findUnique({ where: { key: "last_search" } });
      if (lastCheck?.lastCheckedAt) {
        const hoursSince = (Date.now() - lastCheck.lastCheckedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 6) {
          return NextResponse.json({
            status: "skipped",
            message: `Dernière recherche il y a ${Math.round(hoursSince)}h. Utilisez forceRefresh pour forcer.`,
            lastChecked: lastCheck.lastCheckedAt,
          });
        }
      }
    }

    // Log de démarrage
    const log = await prisma.veilleLog.create({
      data: { action: "search", status: "started", details: "Recherche web des évolutions juridiques" }
    });

    // Recherches ciblées pour l'examen civique français
    const searchQueries = [
      "nouvelle loi France 2025 2026 examen civique réforme",
      "circulaire France 2025 2026 titre séjour naturalisation",
      "nouveau gouvernement France 2025 2026 ministres remaniement",
      "réforme constitution France 2025 2026 institutions",
      "jurisprudence Conseil État laïcité droits 2025 2026",
      "loi immigration France 2025 2026 intégration civique",
      "décret application examen civique QCM 2025 2026",
      "évolution droit asile France 2025 2026 circulaire",
    ];

    const allResults: Array<{
      query: string;
      results: Array<{ url: string; name: string; snippet: string; date?: string }>;
    }> = [];

    for (const query of searchQueries) {
      try {
        const searchResult = await zai.functions.invoke("web_search", {
          query,
          num: 8,
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

    // Analyser les résultats avec l'IA pour identifier les changements pertinents
    const analysisPrompt = `Tu es un expert en droit français et en préparation à l'examen civique français (QCM pour l'obtention du titre de séjour).
    
Analyse les résultats de recherche web suivants et identifie UNIQUEMENT les changements réels et vérifiés qui auraient un impact sur les questions de l'examen civique français.

Les 5 thématiques de l'examen sont :
1. Principes et valeurs de la République (laïcité, devise, symboles)
2. Droits et devoirs (droits fondamentaux, obligations légales)
3. Histoire, géographie et culture
4. Système institutionnel (institutions, élections, gouvernement)
5. Vivre en société (solidarité, vie quotidienne)

Pour chaque changement pertinent, fournis :
- title: Titre court du changement
- description: Description détaillée (2-3 phrases)
- source: URL de la source
- category: "loi" | "circulaire" | "decret" | "gouvernement" | "jurisprudence" | "institutionnel"
- impact: "low" | "medium" | "high" | "critical" (impact sur les questions d'examen)
- themeId: ID du thème concerné ("principes-valeurs" | "droits-devoirs" | "histoire-geographie" | "systeme-institutionnel" | "vivre-societe")
- questionSuggestions: suggestions de questions à ajouter ou modifier (format JSON)

IMPORTANT : 
- Ignore les rumeurs et les projets de loi non adoptés
- Concentre-toi sur les textes effectivement promulgués ou publiés
- Si aucun changement pertinent n'est trouvé, retourne un tableau vide
- Ne PAS inventer de changements

Résultats de recherche :
${JSON.stringify(allResults, null, 2)}

Réponds en JSON uniquement avec ce format :
{
  "changes": [
    {
      "title": "...",
      "description": "...",
      "source": "...",
      "category": "...",
      "impact": "...",
      "themeId": "...",
      "questionSuggestions": [
        {
          "action": "add" | "modify",
          "questionId": null ou "id-existant",
          "suggestedQuestion": {
            "text": "...",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": 0,
            "explanation": "...",
            "type": "connaissance" | "mise-en-situation"
          },
          "reason": "..."
        }
      ]
    }
  ]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert juridique français spécialisé dans l'examen civique. Tu réponds uniquement en JSON valide." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0]?.message?.content || '{"changes":[]}';
    
    let parsedResponse: { changes: Array<{
      title: string;
      description: string;
      source: string;
      category: string;
      impact: string;
      themeId: string;
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
    }> };
    
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { changes: [] };
    } catch {
      parsedResponse = { changes: [] };
    }

    // Sauvegarder les changements détectés en base
    let savedCount = 0;
    for (const change of parsedResponse.changes) {
      const legalUpdate = await prisma.legalUpdate.create({
        data: {
          title: change.title,
          description: change.description,
          source: change.source,
          category: change.category,
          impact: change.impact,
          relevance: "relevant",
          status: "analyzed",
          aiAnalysis: JSON.stringify(change.questionSuggestions),
          analyzedAt: new Date(),
        }
      });

      // Sauvegarder les suggestions de questions
      for (const suggestion of change.questionSuggestions) {
        await prisma.questionSuggestion.create({
          data: {
            legalUpdateId: legalUpdate.id,
            action: suggestion.action,
            themeId: change.themeId,
            questionId: suggestion.questionId,
            suggestedData: JSON.stringify(suggestion.suggestedQuestion),
            reason: suggestion.reason,
            status: suggestion.impact === "critical" ? "auto_applied" : "pending",
            appliedAt: suggestion.impact === "critical" ? new Date() : null,
          }
        });
        savedCount++;
      }
    }

    // Mettre à jour la config de dernière recherche
    await prisma.veilleConfig.upsert({
      where: { key: "last_search" },
      update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
      create: { key: "last_search", value: new Date().toISOString(), description: "Dernière recherche veille IA" }
    });

    // Mettre à jour le log
    const duration = Date.now() - startTime;
    await prisma.veilleLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        details: `${parsedResponse.changes.length} changements détectés, ${savedCount} suggestions de questions`,
        resultsCount: savedCount,
        duration,
      }
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
    
    await prisma.veilleLog.create({
      data: {
        action: "search",
        status: "error",
        details: errorMessage,
      }
    });

    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 }
    );
  }
}
