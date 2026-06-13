import { NextResponse, NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth-middleware";


// Mise à jour des membres du gouvernement via recherche web
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const startTime = Date.now();

  try {
    const zai = await ZAI.create();

    // Rechercher le gouvernement actuel
    const searchResult = await zai.functions.invoke("web_search", {
      query: "gouvernement France 2025 2026 composition ministres Premier ministre",
      num: 10,
    });

    // Analyse IA pour extraire les membres
    const prompt = `Tu es un expert en politique française. À partir des résultats de recherche suivants, identifie TOUS les membres actuels du gouvernement français.

Pour chaque membre, fournis :
- name: Nom complet (Prénom Nom)
- role: Fonction ("Président de la République", "Premier ministre", "Ministre", "Ministre délégué", "Secrétaire d'État")
- ministry: Ministère ou portefeuille complet

IMPORTANT : Ne liste que les membres ACTUELS du gouvernement en fonction. Si tu n'es pas certain, ne les inclus pas.

Résultats de recherche :
${JSON.stringify(searchResult, null, 2)}

Réponds en JSON uniquement :
{
  "members": [
    {
      "name": "...",
      "role": "...",
      "ministry": "..."
    }
  ],
  "lastUpdated": "Date de la dernière source vérifiée",
  "governmentName": "Nom du gouvernement (ex: Gouvernement Bayrou)"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert en politique française. Tu réponds uniquement en JSON valide. Tu ne fournis que des informations vérifiées et factuelles." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content || '{"members":[],"lastUpdated":"","governmentName":""}';
    
    let parsed: {
      members: Array<{ name: string; role: string; ministry: string }>;
      lastUpdated: string;
      governmentName: string;
    };
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { members: [], lastUpdated: "", governmentName: "" };
    } catch {
      parsed = { members: [], lastUpdated: "", governmentName: "" };
    }

    // Désactiver les anciens membres
    await db.governmentMember.updateMany({
      where: { active: true },
      data: { active: false, endDate: new Date() }
    });

    // Insérer les nouveaux membres
    let savedCount = 0;
    for (const member of parsed.members) {
      await db.governmentMember.create({
        data: {
          name: member.name,
          role: member.role,
          ministry: member.ministry,
          active: true,
          startDate: new Date(),
          source: parsed.governmentName || "Veille IA",
        }
      });
      savedCount++;
    }

    // Enregistrer comme changement juridique si c'est un nouveau gouvernement
    const existingGovUpdate = await db.legalUpdate.findFirst({
      where: { category: "gouvernement", title: { contains: parsed.governmentName || "Gouvernement" } }
    });

    if (!existingGovUpdate && savedCount > 0) {
      await db.legalUpdate.create({
        data: {
          title: `${parsed.governmentName} - Composition du gouvernement`,
          description: `Mise à jour de la composition du gouvernement français : ${savedCount} membres identifiés. ${parsed.lastUpdated}`,
          source: "Veille IA - Recherche web",
          category: "gouvernement",
          impact: "high",
          relevance: "relevant",
          status: "analyzed",
          aiAnalysis: JSON.stringify({ governmentName: parsed.governmentName, memberCount: savedCount }),
          analyzedAt: new Date(),
        }
      });
    }

    // Log
    const duration = Date.now() - startTime;
    await db.veilleLog.create({
      data: {
        action: "government_update",
        status: "completed",
        details: `${parsed.governmentName || "Gouvernement"}: ${savedCount} membres identifiés`,
        resultsCount: savedCount,
        duration,
      }
    });

    // Mettre à jour la config
    await db.veilleConfig.upsert({
      where: { key: "last_government_update" },
      update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
      create: { key: "last_government_update", value: new Date().toISOString(), description: "Dernière mise à jour gouvernement" }
    });

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
    
    await db.veilleLog.create({
      data: {
        action: "government_update",
        status: "error",
        details: `Erreur interne`,
      }
    });

    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET: Récupérer les membres actuels du gouvernement
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth(req);
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
