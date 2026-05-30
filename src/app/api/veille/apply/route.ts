import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Appliquer ou rejeter une suggestion de question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestionId, action } = body; // action: "approve" | "reject"

    if (!suggestionId || !action) {
      return NextResponse.json(
        { status: "error", message: "suggestionId et action (approve/reject) requis" },
        { status: 400 }
      );
    }

    const suggestion = await prisma.questionSuggestion.findUnique({
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
      await prisma.questionSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: "approved",
          approvedAt: new Date(),
        }
      });

      // Marquer le changement juridique comme appliqué si toutes les suggestions sont traitées
      const pendingSuggestions = await prisma.questionSuggestion.count({
        where: {
          legalUpdateId: suggestion.legalUpdateId,
          status: "pending"
        }
      });

      if (pendingSuggestions === 0) {
        await prisma.legalUpdate.update({
          where: { id: suggestion.legalUpdateId },
          data: { status: "applied", appliedAt: new Date() }
        });
      }

      await prisma.veilleLog.create({
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

    } else if (action === "reject") {
      await prisma.questionSuggestion.update({
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

    } else {
      return NextResponse.json(
        { status: "error", message: "Action invalide. Utilisez 'approve' ou 'reject'" },
        { status: 400 }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 }
    );
  }
}
