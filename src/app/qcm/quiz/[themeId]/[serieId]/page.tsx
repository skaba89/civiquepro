"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { allThemes } from "@/lib/qcm-data";
import { QuizPlayer } from "@/components/quiz-player";

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;
  const serieId = params.serieId as string;

  const theme = allThemes.find(t => t.id === themeId);
  const serie = theme?.series.find(s => s.id === serieId);

  if (!theme || !serie) {
    return <div className="p-8 text-center">QCM non trouvé</div>;
  }

  return (
    <QuizPlayer
      questions={serie.questions}
      title={serie.title}
      onBack={() => router.push(`/qcm/theme/${themeId}`)}
      themeId={themeId}
    />
  );
}
