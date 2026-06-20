/**
 * Helpers partagés pour les routes /api/veille/*
 *
 * Centralise :
 *  - les prompts IA (analyse juridique, gouvernement, digest)
 *  - les listes de requêtes de recherche
 *  - l'extraction JSON depuis une réponse LLM
 *  - la persistance LegalUpdate + QuestionSuggestion
 *  - l'upsert VeilleConfig
 *  - le helper SSE (encoder + ReadableStream)
 *
 * But : éviter la duplication de ~650 lignes entre /cron et /search, et
 * faciliter l'ajout d'étapes partagées (log, config, gestion d'erreur).
 */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Types partagés
// ─────────────────────────────────────────────────────────────────────────────

export interface WebSearchResult {
  url: string;
  name: string;
  snippet: string;
  date?: string;
}

export interface QuestionSuggestionInput {
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
}

export interface LegalChange {
  title: string;
  description: string;
  source: string;
  category: string;
  impact: string;
  themeId: string;
  officialSource?: boolean;
  questionSuggestions: QuestionSuggestionInput[];
}

export interface ProgramChanges {
  examFormatChanged: boolean;
  syllabusChanged: boolean;
  passingThresholdChanged: boolean;
  details: string;
}

export interface LegalAnalysisResult {
  changes: LegalChange[];
  programChanges?: ProgramChanges;
}

export interface GovernmentMemberInput {
  name: string;
  role: string;
  ministry: string;
}

export interface GovernmentAnalysisResult {
  members: GovernmentMemberInput[];
  lastUpdated: string;
  governmentName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes métier
// ─────────────────────────────────────────────────────────────────────────────

/** Thématiques officielles de l'examen civique français. */
export const EXAM_THEMES = [
  "principes-valeurs",
  "droits-devoirs",
  "histoire-geographie",
  "systeme-institutionnel",
  "vivre-societe",
] as const;

export const THEME_LABELS: Record<string, string> = {
  "principes-valeurs": "Principes et valeurs de la République",
  "droits-devoirs": "Droits et devoirs",
  "histoire-geographie": "Histoire, géographie et culture",
  "systeme-institutionnel": "Système institutionnel",
  "vivre-societe": "Vivre en société",
};

/** Requêtes de recherche ciblées pour la veille juridique (cron complet). */
export const CRON_SEARCH_QUERIES: string[] = [
  "site:legifrance.gouv.fr nouvelle loi 2025 2026 examen civique naturalisation",
  "site:legifrance.gouv.fr décret application examen civique QCM 2026",
  "site:legifrance.gouv.fr circulaire naturalisation titre séjour 2025 2026",
  "site:vie-publique.fr nouvelle loi décret 2025 2026 réforme",
  "site:service-public.gouv.fr examen civique titre séjour 2026",
  "site:ofii.fr réforme intégration républicaine examen civique",
  "gouvernement France 2026 remaniement ministres composition",
  "réforme constitutionnelle France 2025 2026 institutions",
  "arrêté examen civique QCM 2026 programme modifié",
  "réforme droit asile France 2025 2026 circulaire OFPRA",
  "loi immigration intégration républicaine France 2025 2026",
  "jurisprudence Conseil État laïcité droits fondamentaux 2025 2026",
  "préfecture France réforme titre séjour 2026 conditions",
  "OFII formation civique nouveau programme 2025 2026",
  "cycle d'accueil étrangers France réforme 2026",
];

/** Requêtes plus légères pour la recherche manuelle /search. */
export const SEARCH_QUERIES_LIGHT: string[] = [
  "nouvelle loi France 2025 2026 examen civique réforme",
  "circulaire France 2025 2026 titre séjour naturalisation",
  "nouveau gouvernement France 2025 2026 ministres remaniement",
  "réforme constitution France 2025 2026 institutions",
  "jurisprudence Conseil État laïcité droits 2025 2026",
  "loi immigration France 2025 2026 intégration civique",
  "décret application examen civique QCM 2025 2026",
  "évolution droit asile France 2025 2026 circulaire",
];

/** Sources officielles à vérifier périodiquement. */
export const OFFICIAL_SOURCE_SEARCHES: Array<{ query: string; source: string }> = [
  { query: "site:legifrance.gouv.fr examen civique arrêté 2026", source: "Légifrance" },
  { query: "site:service-public.gouv.fr examen civique titre séjour 2026", source: "Service-Public" },
  { query: "site:ofii.fr intégration républicaine examen 2026", source: "OFII" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Prompts IA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construit le prompt d'analyse juridique pour la veille.
 * @param allResults - Résultats de recherche web à analyser
 * @param includeProgramChanges - Inclure la détection de changements du programme
 */
export function buildLegalAnalysisPrompt(
  allResults: Array<{ query: string; results: WebSearchResult[] }>,
  includeProgramChanges = false
): string {
  const programChangesSection = includeProgramChanges
    ? `  "programChanges": { "examFormatChanged":false, "syllabusChanged":false, "passingThresholdChanged":false, "details":"" }`
    : "";

  const programChangesDoc = includeProgramChanges
    ? `- officialSource: true si .gouv.fr
- questionSuggestions: suggestions de questions`
    : `- questionSuggestions: suggestions de questions à ajouter ou modifier (format JSON)`;

  return `Tu es un expert en droit français et en préparation à l'examen civique français (QCM pour l'obtention du titre de séjour).

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
- themeId: ID du thème concerné (${EXAM_THEMES.map(t => `"${t}"`).join(" | ")})
${programChangesDoc}

IMPORTANT : Ne PAS inventer de changements. Ignore les rumeurs.

Résultats :
${JSON.stringify(allResults, null, 2)}

Réponds en JSON :
{
  "changes": [{ "title":"...", "description":"...", "source":"...", "category":"...", "impact":"...", "themeId":"...", "officialSource":true/false, "questionSuggestions":[{ "action":"add", "questionId":null, "suggestedQuestion":{ "text":"...", "options":["..."], "correctAnswer":0, "explanation":"...", "type":"connaissance" }, "reason":"..." }] }],${programChangesSection}
}`;
}

/**
 * Construit le prompt d'analyse IA pour identifier les membres du gouvernement.
 */
export function buildGovernmentPrompt(searchResult: unknown): string {
  return `Tu es un expert en politique française. Identifie TOUS les membres actuels du gouvernement français.

Pour chaque membre : name, role, ministry.

Résultats :
${JSON.stringify(searchResult, null, 2)}

Réponds en JSON : { "members": [{ "name": "...", "role": "...", "ministry": "..." }], "lastUpdated": "...", "governmentName": "..." }`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires JSON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrait le premier objet JSON valide trouvé dans une chaîne.
 * Gère le wrapping par des blocs markdown ```json ... ```.
 */
export function extractJsonFromString<T>(raw: string, fallback: T): T {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? (JSON.parse(jsonMatch[0]) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persiste un changement juridique + ses suggestions de questions en base.
 * @returns nombre de suggestions sauvegardées
 */
export async function saveLegalChange(
  change: LegalChange,
  options: { skipDuplicates?: boolean } = {}
): Promise<{ legalUpdateId: string; savedSuggestions: number }> {
  if (options.skipDuplicates) {
    const existing = await db.legalUpdate.findFirst({
      where: { title: change.title, source: change.source },
    });
    if (existing) {
      return { legalUpdateId: existing.id, savedSuggestions: 0 };
    }
  }

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
    },
  });

  let savedSuggestions = 0;
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
      },
    });
    savedSuggestions++;
  }

  return { legalUpdateId: legalUpdate.id, savedSuggestions };
}

/**
 * Persiste un changement de programme (impact critical) s'il n'existe pas déjà
 * dans les 7 derniers jours.
 */
export async function saveProgramChangeIfNeeded(programChanges: ProgramChanges): Promise<boolean> {
  if (
    !programChanges.examFormatChanged &&
    !programChanges.syllabusChanged &&
    !programChanges.passingThresholdChanged
  ) {
    return false;
  }

  const existing = await db.legalUpdate.findFirst({
    where: {
      title: { contains: "Changement du programme" },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  if (existing) return false;

  await db.legalUpdate.create({
    data: {
      title: "⚠️ Changement du programme de l'examen civique détecté",
      description: programChanges.details,
      source: "Veille automatique - Analyse multi-sources",
      category: "institutionnel",
      impact: "critical",
      relevance: "relevant",
      status: "analyzed",
      aiAnalysis: JSON.stringify(programChanges),
      analyzedAt: new Date(),
    },
  });
  return true;
}

/**
 * Remplace l'ensemble du gouvernement actif en base par une nouvelle liste.
 * @returns true si le gouvernement a changé (nombre différent de membres actifs)
 */
export async function replaceGovernment(
  parsed: GovernmentAnalysisResult
): Promise<{ changed: boolean; savedCount: number }> {
  const currentActive = await db.governmentMember.count({ where: { active: true } });
  const governmentChanged = parsed.members.length > 0 && parsed.members.length !== currentActive;

  if (!governmentChanged) {
    return { changed: false, savedCount: 0 };
  }

  await db.governmentMember.updateMany({
    where: { active: true },
    data: { active: false, endDate: new Date() },
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
      },
    });
  }

  const existingGovUpdate = await db.legalUpdate.findFirst({
    where: {
      category: "gouvernement",
      title: { contains: parsed.governmentName || "Gouvernement" },
    },
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
        aiAnalysis: JSON.stringify({
          governmentName: parsed.governmentName,
          memberCount: parsed.members.length,
        }),
        analyzedAt: new Date(),
      },
    });
  }

  return { changed: true, savedCount: parsed.members.length };
}

/**
 * Upsert d'une clé de configuration veille (dernière recherche, dernier cron, etc.).
 */
export async function upsertVeilleConfig(
  key: string,
  description: string
): Promise<void> {
  await db.veilleConfig.upsert({
    where: { key },
    update: { lastCheckedAt: new Date(), value: new Date().toISOString() },
    create: { key, value: new Date().toISOString(), description },
  });
}

/**
 * Crée une entrée VeilleLog.
 */
export async function logVeilleAction(params: {
  action: string;
  status: "started" | "completed" | "error";
  details: string;
  resultsCount?: number;
  duration?: number;
}): Promise<void> {
  await db.veilleLog.create({
    data: {
      action: params.action,
      status: params.status,
      details: params.details,
      resultsCount: params.resultsCount,
      duration: params.duration,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper SSE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée une Response SSE (text/event-stream) qui exécute un callback asynchrone.
 * Le callback reçoit une fonction `send(event, data)` pour émettre des événements.
 */
export function createSseResponse(
  handler: (send: (event: string, data: unknown) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };
      try {
        await handler(send);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Type du client ZAI (instance retournée par ZAI.create()).
 */
type ZAIClient = Awaited<ReturnType<typeof ZAI.create>>;

/**
 * Exécute N requêtes de recherche web et renvoie les résultats agrégés.
 * Les erreurs sur une requête sont loggées mais n'interrompent pas les autres.
 */
export async function runWebSearches(
  zai: ZAIClient,
  queries: string[],
  numPerQuery = 6,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ query: string; results: WebSearchResult[] }>> {
  const allResults: Array<{ query: string; results: WebSearchResult[] }> = [];
  for (let i = 0; i < queries.length; i++) {
    try {
      const searchResult = await zai.functions.invoke("web_search", {
        query: queries[i],
        num: numPerQuery,
      });
      allResults.push({
        query: queries[i],
        results: (searchResult || []).map(r => ({
          url: r.url,
          name: r.name,
          snippet: r.snippet,
          date: r.date,
        })),
      });
    } catch (err) {
      console.error(`Search failed for "${queries[i]}":`, err);
    }
    onProgress?.(i + 1, queries.length);
  }
  return allResults;
}

/**
 * Détermine si une recherche doit être skipped (dernière recherche < 6h).
 */
export async function shouldSkipSearch(
  forceRefresh: boolean
): Promise<{ skip: boolean; hoursSince?: number; lastChecked?: Date }> {
  if (forceRefresh) return { skip: false };
  const lastCheck = await db.veilleConfig.findUnique({ where: { key: "last_search" } });
  if (lastCheck?.lastCheckedAt) {
    const hoursSince = (Date.now() - lastCheck.lastCheckedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 6) {
      return { skip: true, hoursSince, lastChecked: lastCheck.lastCheckedAt };
    }
  }
  return { skip: false };
}

/**
 * Valide le format d'un ID de suggestion (cuid).
 */
export function isValidCuid(id: unknown): id is string {
  return typeof id === "string" && id.startsWith("c") && id.length <= 30;
}

/**
 * Valide qu'un themeId est dans la liste des thèmes autorisés.
 */
export function isValidThemeId(themeId: unknown): themeId is string {
  return typeof themeId === "string" && (EXAM_THEMES as readonly string[]).includes(themeId);
}
