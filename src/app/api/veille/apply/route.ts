import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";
import { isValidCuid, logVeilleAction } from "@/lib/veille";

/**
 * POST /api/veille/apply
 * Appliquer ou rejeter une suggestion de question.
 * Body: { suggestionId, action: "approve" | "reject" }
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { suggestionId, action } = body;

    if (!suggestionId || !action) {
      return NextResponse.json(
        { status: "error", message: "suggestionId et action (approve/reject) requis" },
        { status: 400 }
      );
    }

    if (!isValidCuid(suggestionId)) {
      return NextResponse.json(
        { status: "error", message: "suggestionId invalide" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { status: "error", message: "Action invalide. Utilisez 'approve' ou 'reject'" },
        { status: 400 }
      );
    }

    const suggestion = await db.questionSuggestion.findUnique({
      where: { id: suggestionId },
      include: { legalUpdate: true },
    });

    if (!suggestion) {
      return NextResponse.json(
        { status: "error", message: "Suggestion non trouvée" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await db.questionSuggestion.update({
        where: { id: suggestionId },
        data: { status: "approved", approvedAt: new Date() },
      });

      const pendingSuggestions = await db.questionSuggestion.count({
        where: { legalUpdateId: suggestion.legalUpdateId, status: "pending" },
      });

      if (pendingSuggestions === 0) {
        await db.legalUpdate.update({
          where: { id: suggestion.legalUpdateId },
          data: { status: "applied", appliedAt: new Date() },
        });
      }

      await logVeilleAction({
        action: "apply",
        status: "completed",
        details: `Suggestion approuvée: ${suggestion.reason}`,
      });

      return NextResponse.json({
        status: "approved",
        suggestionId,
        questionData: JSON.parse(suggestion.suggestedData),
        themeId: suggestion.themeId,
      });
    }

    // action === "reject" (validated above)
    await db.questionSuggestion.update({
      where: { id: suggestionId },
      data: { status: "rejected", rejectedAt: new Date() },
    });

    return NextResponse.json({ status: "rejected", suggestionId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille apply error:", errorMessage);
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
