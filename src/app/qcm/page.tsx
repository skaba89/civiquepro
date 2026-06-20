"use client";

import React from "react";
import Link from "next/link";
import { allThemes } from "@/lib/qcm-data";
import { THEME_ICONS, THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight, Clock, CheckCircle2,
  Play, Lightbulb, Trophy,
} from "lucide-react";

export default function QCMPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "QCM" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "var(--font-open-sans)" }}>QCM Examen Civique 2026 gratuits en ligne</h1>

      {/* All series from all themes */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {allThemes.flatMap(t => t.series).map((serie) => {
          const theme = allThemes.find(t => t.series.some(s => s.id === serie.id))!;
          const c = THEME_COLORS[theme.id];
          return (
            <Link key={serie.id} href={`/qcm/quiz/${theme.id}/${serie.id}`}>
              <Card className="border-2 hover:border-violet-600 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={`${c.light} ${c.text}`}>{theme.shortTitle}</Badge>
                    <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" /> Chronométré</span>
                  </div>
                  <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>{serie.title}</CardTitle>
                  <CardDescription>{serie.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full ${c.bg} hover:opacity-90 text-white font-semibold`}>
                    <Play className="mr-2 w-4 h-4" /> Démarrer
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Separator className="my-12" />

      {/* By Theme */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Les cinq catégories de QCM examen civique</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allThemes.map((theme) => {
          const c = THEME_COLORS[theme.id];
          return (
            <Link key={theme.id} href={`/qcm/theme/${theme.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-all group border-2 h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[theme.id]}</div>
                  <CardTitle className="text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>QCM {theme.shortTitle}</CardTitle>
                  <CardDescription>{theme.questionCount} questions par série - {theme.series.length} séries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">{theme.subThemes.map((st) => (<Badge key={st} variant="secondary" className="text-xs">{st}</Badge>))}</div>
                  <Button variant="outline" className={`w-full ${c.text} border-current`}>Accéder aux QCM <ChevronRight className="ml-1 w-4 h-4" /></Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>À quoi servent les QCM examen civique d&apos;entraînement ?</h2>
          <div className="text-gray-600 space-y-3 leading-relaxed">
            <p>Les QCM d&apos;entraînement constituent l&apos;outil le plus efficace pour préparer l&apos;examen civique. Ils permettent de se familiariser avec le format de l&apos;épreuve et d&apos;identifier ses lacunes.</p>
            <p>Nos QCM couvrent l&apos;intégralité du programme officiel et sont conformes à l&apos;arrêté du 10 octobre 2025.</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Les QCM examen civique 2026, en résumé</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, text: "40 questions conformes au programme" },
              { icon: <Clock className="w-5 h-5 text-violet-600" />, text: "45 minutes chronométrées" },
              { icon: <Trophy className="w-5 h-5 text-amber-600" />, text: "Seuil de réussite : 32/40 (80 %)" },
              { icon: <Lightbulb className="w-5 h-5 text-purple-600" />, text: "Corrections détaillées pour chaque question" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">{item.icon}<span className="text-sm font-medium text-gray-700">{item.text}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
