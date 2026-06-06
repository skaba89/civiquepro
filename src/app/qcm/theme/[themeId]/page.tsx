"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { allThemes } from "@/lib/qcm-data";
import { THEME_ICONS, THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock, CheckCircle2, AlertCircle, Play,
} from "lucide-react";

export default function ThemePage() {
  const params = useParams();
  const themeId = params.themeId as string;
  const theme = allThemes.find(t => t.id === themeId);

  if (!theme) {
    return <div className="p-8 text-center">Thématique non trouvée</div>;
  }

  const c = THEME_COLORS[theme.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "QCM", href: "/qcm" }, { label: theme.title }]} />
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-xl ${c.bg} text-white flex items-center justify-center`}>{THEME_ICONS[theme.id]}</div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>QCM {theme.title}</h1>
          <p className="text-gray-500 mt-1">pour l&apos;examen civique 2026</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {theme.series.map((serie) => (
          <Link key={serie.id} href={`/qcm/quiz/${theme.id}/${serie.id}`}>
            <Card className="border-2 hover:border-violet-500 transition-all group cursor-pointer h-full">
              <CardHeader>
                <Badge className={`w-fit ${c.light} ${c.text}`}>{serie.questions.length} questions</Badge>
                <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>{serie.title}</CardTitle>
                <CardDescription>{serie.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Chronométré</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Corrigé</span>
                  </div>
                  <Button className={`${c.bg} hover:opacity-90 text-white font-semibold`}><Play className="mr-2 w-4 h-4" /> Démarrer</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>À propos des QCM {theme.shortTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed mb-4">{theme.description}</p>
            <div className="space-y-2">{theme.subThemes.map((st) => (<div key={st} className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${c.text}`} /><span className="text-sm text-gray-700">{st}</span></div>))}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader><CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-open-sans)" }}><AlertCircle className="w-5 h-5 text-amber-600" />Points de vigilance</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{theme.pointsVigilance}</p>
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <p className="text-sm text-gray-600"><strong>Conseil :</strong> Entraînez-vous régulièrement sur les mises en situation. Les corrections détaillées vous aideront à comprendre les nuances.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
