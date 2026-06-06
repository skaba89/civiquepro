"use client";

import React from "react";
import Link from "next/link";
import { allThemes } from "@/lib/qcm-data";
import { THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Clock, Trophy, CheckCircle2, Play,
} from "lucide-react";

export default function ExamenBlancPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Examen Blanc" }]} />
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Examen Blanc Examen Civique 2026</h1>
          <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
            <p>Simulez les conditions réelles de l&apos;examen civique avec notre examen blanc complet. 45 minutes pour répondre à 40 questions couvrant les 5 thématiques.</p>
            <p>L&apos;examen blanc reproduit fidèlement le format : questions de connaissance, mises en situation et seuil de réussite à 80 %.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: <FileText className="w-5 h-5 text-violet-600" />, label: "40 questions", sub: "5 thématiques" },
              { icon: <Clock className="w-5 h-5 text-amber-600" />, label: "45 minutes", sub: "Chronométré" },
              { icon: <Trophy className="w-5 h-5 text-green-600" />, label: "32/40", sub: "Pour réussir" },
              { icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />, label: "Corrigé", sub: "Détaillé" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">{item.icon}<div><div className="font-semibold text-gray-900 text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.sub}</div></div></div>
            ))}
          </div>
          <Link href="/examen-blanc/quiz">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-violet-600/25 w-full sm:w-auto">
              <Play className="mr-2 w-5 h-5" /> Démarrer l&apos;examen blanc
            </Button>
          </Link>
        </div>
        <Card className="border-2">
          <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>Répartition des questions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allThemes.map((theme) => {
                const c = THEME_COLORS[theme.id];
                return (
                  <div key={theme.id}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-700">{theme.shortTitle}</span><span className="text-sm font-bold text-gray-900">{theme.questionCount}</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${c.bg} rounded-full`} style={{ width: `${(theme.questionCount / 40) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm"><span className="font-semibold text-gray-700">Total</span><span className="font-bold text-gray-900">40 questions</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
