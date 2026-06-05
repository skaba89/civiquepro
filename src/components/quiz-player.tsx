"use client";

import React, { useState, useRef } from "react";
import { type Question, EXAM_CONFIG } from "@/lib/qcm-data";
import { THEME_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight, ChevronLeft, Clock, CheckCircle2, XCircle,
  Trophy, Lightbulb, Play, RotateCcw,
} from "lucide-react";

interface QuizPlayerProps {
  questions: Question[];
  title: string;
  onBack: () => void;
  themeId?: string;
  isExamBlanc?: boolean;
}

export function QuizPlayer({ questions, title, onBack, themeId, isExamBlanc = false }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(questions.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = themeId ? THEME_COLORS[themeId] : THEME_COLORS["principes-valeurs"];
  const question = questions[currentIdx];
  const selectedAnswer = answers[currentIdx];
  const isAnswered = selectedAnswer !== null;

  // Timer
  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const next = [...answers];
    next[currentIdx] = idx;
    setAnswers(next);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(answers[currentIdx + 1] !== null);
    } else {
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowExplanation(answers[currentIdx - 1] !== null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowExplanation(false);
    setTimeLeft(EXAM_CONFIG.timeLimit);
    setIsFinished(false);
  };

  const correct = answers.filter((a, i) => a === questions[i].correctAnswer).length;
  const incorrect = answers.filter((a) => a !== null).length - correct;
  const timeUsed = EXAM_CONFIG.timeLimit - timeLeft;

  // ==================== RESULTS VIEW ====================
  if (isFinished) {
    const percent = Math.round((correct / questions.length) * 100);
    const passed = percent >= EXAM_CONFIG.passingPercent;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${passed ? "bg-green-100" : "bg-red-100"}`}>
              {passed ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
            </div>
            <CardTitle className="text-2xl mt-4" style={{ fontFamily: "var(--font-open-sans)" }}>
              {passed ? "Félicitations !" : "Continuez vos révisions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{correct}/{questions.length}</div>
            <p className="text-gray-600 mb-6">{percent}% de bonnes réponses {passed ? "— Vous avez réussi !" : "— Seuil requis : 80 %"}</p>
            <Progress value={percent} className={`h-3 mb-6 ${passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} />
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-green-50 rounded-xl"><div className="text-2xl font-bold text-green-600">{correct}</div><div className="text-xs text-gray-600">Correctes</div></div>
              <div className="p-4 bg-red-50 rounded-xl"><div className="text-2xl font-bold text-red-600">{incorrect}</div><div className="text-xs text-gray-600">Incorrectes</div></div>
              <div className="p-4 bg-blue-50 rounded-xl"><div className="text-2xl font-bold text-blue-600">{formatTime(timeUsed)}</div><div className="text-xs text-gray-600">Temps utilisé</div></div>
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <Button variant="outline" onClick={onBack} className="font-semibold"><ChevronLeft className="mr-2 w-4 h-4" /> Retour</Button>
              <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"><RotateCcw className="mr-2 w-4 h-4" /> Recommencer</Button>
            </div>

            {/* Detailed corrections */}
            <Separator className="my-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-left" style={{ fontFamily: "var(--font-open-sans)" }}>Corrections détaillées</h3>
            <div className="space-y-4 text-left max-h-[600px] overflow-y-auto">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                      <p className="text-sm font-medium text-gray-900">Q{i + 1}. {q.text}</p>
                    </div>
                    {!isCorrect && userAnswer !== null && (
                      <p className="text-sm text-red-700 ml-7 mb-1">Votre réponse : {q.options[userAnswer]}</p>
                    )}
                    <p className="text-sm text-green-700 ml-7 mb-2">Bonne réponse : {q.options[q.correctAnswer]}</p>
                    <p className="text-xs text-gray-600 ml-7 leading-relaxed">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== QUIZ VIEW ====================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
            <Clock className="w-4 h-4" /><span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <span className="text-sm text-gray-500 font-medium">{currentIdx + 1}/{questions.length}</span>
        </div>
      </div>

      <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 mb-8 [&>div]:bg-blue-600" />

      <Card className="border-2 mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={question.type === "mise-en-situation" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}>
              {question.type === "mise-en-situation" ? "Mise en situation" : "Connaissance"}
            </Badge>
            <Badge variant="secondary" className={`${colors.light} ${colors.text}`}>Question {currentIdx + 1}</Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed" style={{ fontFamily: "var(--font-open-sans)" }}>{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let optStyle = "border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
              if (isAnswered) {
                if (idx === question.correctAnswer) optStyle = "border-2 border-green-500 bg-green-50 cursor-default";
                else if (idx === selectedAnswer) optStyle = "border-2 border-red-500 bg-red-50 cursor-default";
                else optStyle = "border-2 border-gray-200 opacity-60 cursor-default";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl transition-all ${optStyle}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                      isAnswered && idx === question.correctAnswer ? "bg-green-600 text-white" :
                      isAnswered && idx === selectedAnswer ? "bg-red-600 text-white" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {isAnswered && idx === question.correctAnswer ? <CheckCircle2 className="w-5 h-5" /> :
                       isAnswered && idx === selectedAnswer ? <XCircle className="w-5 h-5" /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-6 p-5 rounded-xl border-2 ${selectedAnswer === question.correctAnswer ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === question.correctAnswer ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Lightbulb className="w-5 h-5 text-amber-600" />}
                <span className={`font-semibold ${selectedAnswer === question.correctAnswer ? "text-green-700" : "text-amber-700"}`}>
                  {selectedAnswer === question.correctAnswer ? "Bonne réponse !" : "Correction"}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} className="font-semibold">
          <ChevronLeft className="mr-1 w-4 h-4" /> Précédent
        </Button>
        <div className="flex gap-1 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => { setCurrentIdx(i); setShowExplanation(answers[i] !== null); }}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                i === currentIdx ? "bg-blue-600 text-white" :
                answers[i] !== null ? (answers[i] === questions[i].correctAnswer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700") :
                "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          {currentIdx === questions.length - 1 ? "Terminer" : "Suivant"} <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
