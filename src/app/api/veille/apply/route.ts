import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-middleware";


// Appliquer ou rejeter une suggestion de question
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { suggestionId, action } = body; // action: "approve" | "reject"

    if (!suggestionId || !action) {
      return NextResponse.json(
        { status: "error", message: "suggestionId et action (approve/reject) requis" },
        { status: 400 }
      );
    }

    // Validate suggestionId format (cuid)
    if (typeof suggestionId !== 'string' || !suggestionId.startsWith('c') || suggestionId.length > 30) {
      return NextResponse.json(
        { status: "error", message: "suggestionId invalide" },
        { status: 400 }
      );
    }

    // Validate action against allowed values
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { status: "error", message: "Action invalide. Utilisez 'approve' ou 'reject'" },
        { status: 400 }
      );
    }

    const suggestion = await db.questionSuggestion.findUnique({
      where: { id: suggestionId },
      include: { legalUpdate: true }
    });

    if (!suggestion) {
      return NextResponse.json(
        { status: "error", message: "Suggestion non trouvée" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Marquer la suggestion comme approuvée
      await db.questionSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: "approved",
          approvedAt: new Date(),
        }
      });

      // Marquer le changement juridique comme appliqué si toutes les suggestions sont traitées
      const pendingSuggestions = await db.questionSuggestion.count({
        where: {
          legalUpdateId: suggestion.legalUpdateId,
          status: "pending"
        }
      });

      if (pendingSuggestions === 0) {
        await db.legalUpdate.update({
          where: { id: suggestion.legalUpdateId },
          data: { status: "applied", appliedAt: new Date() }
        });
      }

      await db.veilleLog.create({
        data: {
          action: "apply",
          status: "completed",
          details: `Suggestion approuvée: ${suggestion.reason}`,
        }
      });

      return NextResponse.json({
        status: "approved",
        suggestionId,
        questionData: JSON.parse(suggestion.suggestedData),
        themeId: suggestion.themeId,
      });

    } else {
      // action === "reject" (validated above)
      await db.questionSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
        }
      });

      return NextResponse.json({
        status: "rejected",
        suggestionId,
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Veille apply error:", errorMessage);
    return NextResponse.json(
      { status: "error", message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
