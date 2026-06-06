"use client";

import React, { useState } from "react";
import { allThemes } from "@/lib/qcm-data";
import { THEME_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function QuestionsPage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const allQuestions = allThemes.flatMap(t => t.series[0].questions.map(q => ({ ...q, themeId: t.id, themeTitle: t.shortTitle })));
  const filteredQuestions = selectedTheme ? allQuestions.filter(q => q.themeId === selectedTheme) : allQuestions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Questions Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Parcourez l&apos;ensemble des questions de l&apos;examen civique, classées par thématique. Chaque question est accompagnée de sa correction.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant={selectedTheme === null ? "default" : "outline"} className={selectedTheme === null ? "bg-violet-600 text-white" : ""} onClick={() => setSelectedTheme(null)}>
          Toutes ({allQuestions.length})
        </Button>
        {allThemes.map((theme) => (
          <Button key={theme.id} variant={selectedTheme === theme.id ? "default" : "outline"} className={selectedTheme === theme.id ? `${THEME_COLORS[theme.id].bg} text-white` : ""} onClick={() => setSelectedTheme(theme.id)}>
            {theme.shortTitle} ({allQuestions.filter(q => q.themeId === theme.id).length})
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredQuestions.map((q, i) => {
          const c = THEME_COLORS[q.themeId];
          const isExpanded = expandedQ === q.id;
          return (
            <Card key={q.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${c.bg} text-white flex items-center justify-center shrink-0 text-sm font-bold`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={q.type === "mise-en-situation" ? "bg-purple-100 text-purple-700 text-xs" : "bg-gray-100 text-gray-700 text-xs"}>
                        {q.type === "mise-en-situation" ? "Mise en situation" : "Connaissance"}
                      </Badge>
                      <Badge variant="secondary" className={`${c.light} ${c.text} text-xs`}>{q.themeTitle}</Badge>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">{q.text}</p>
                    <button onClick={() => setExpandedQ(isExpanded ? null : q.id)} className="text-sm text-violet-600 font-medium hover:text-violet-800 flex items-center gap-1">
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      {isExpanded ? "Masquer la correction" : "Voir la correction"}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="space-y-1">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`p-2 rounded-lg flex items-start gap-2 text-sm ${idx === q.correctAnswer ? "bg-green-50 border border-green-300" : "bg-gray-50"}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${idx === q.correctAnswer ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {idx === q.correctAnswer ? "✓" : String.fromCharCode(65 + idx)}
                              </span>
                              <span className={idx === q.correctAnswer ? "text-green-800 font-medium" : "text-gray-600"}>{opt}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
