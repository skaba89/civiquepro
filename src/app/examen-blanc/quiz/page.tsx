"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { generateFullExam } from "@/lib/qcm-data";
import { QuizPlayer } from "@/components/quiz-player";

export default function ExamenBlancQuizPage() {
  const router = useRouter();
  const [questions] = useState(() => generateFullExam());
  return (
    <QuizPlayer
      questions={questions}
      title="Examen Blanc - 40 questions"
      onBack={() => router.push("/examen-blanc")}
      isExamBlanc
    />
  );
}
