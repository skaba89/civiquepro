"use client";

import React from "react";
import Link from "next/link";
import { allThemes } from "@/lib/qcm-data";
import { THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Clock, Trophy, CheckCircle2, Play, AlertCircle, Lightbulb,
} from "lucide-react";

export default function ExamenBlancPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Examen Blanc" }]} />

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>
            Examen Blanc Examen Civique 2026
          </h1>
          <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
            <p>
              Simulez les conditions réelles de l&apos;examen civique avec notre examen blanc complet.
              Vous disposez de 45 minutes pour répondre à 40 questions couvrant l&apos;intégralité des
              5 thématiques officielles du programme. Cette simulation vous permet d&apos;évaluer votre
              niveau de préparation et d&apos;identifier les thématiques à retravailler avant le jour J.
            </p>
            <p>
              L&apos;examen blanc reproduit fidèlement le format officiel : alternance de questions de
              connaissance générale et de mises en situation pratiques, seuil de réussite fixé à 32
              bonnes réponses sur 40 (soit 80 %), et chronométrage strict. À la fin de la session,
              vous recevez une correction détaillée expliquant chaque bonne réponse avec la référence
              au texte de loi ou à la source officielle concernée.
            </p>
            <p>
              Cet entraînement est particulièrement recommandé dans les 15 jours précédant votre
              convocation à l&apos;OFII. Il vous habitue à la pression du temps et à la diversité des
              questions posées, deux facteurs qui expliquent la majorité des échecs recensés chaque
              année. Le fait de pouvoir recommencer plusieurs fois l&apos;examen blanc vous permet de
              mesurer votre progression et de renforcer votre confiance avant l&apos;épreuve réelle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: <FileText className="w-5 h-5 text-violet-600" />, label: "40 questions", sub: "5 thématiques" },
              { icon: <Clock className="w-5 h-5 text-amber-600" />, label: "45 minutes", sub: "Chronométré" },
              { icon: <Trophy className="w-5 h-5 text-green-600" />, label: "32/40", sub: "Pour réussir" },
              { icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />, label: "Corrigé", sub: "Détaillé" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                {item.icon}
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/examen-blanc/quiz">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-violet-600/25 w-full sm:w-auto">
              <Play className="mr-2 w-5 h-5" /> Démarrer l&apos;examen blanc
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>Répartition des questions</CardTitle>
              <CardDescription>
                L&apos;examen civique couvre 5 thématiques obligatoires définies par le programme officiel
                de l&apos;OFII. Voici la répartition indicative des 40 questions que vous rencontrerez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allThemes.map((theme) => {
                  const c = THEME_COLORS[theme.id];
                  return (
                    <div key={theme.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{theme.shortTitle}</span>
                        <span className="text-sm font-bold text-gray-900">{theme.questionCount}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.bg} rounded-full`} style={{ width: `${(theme.questionCount / 40) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-gray-900">40 questions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Conseils pour réussir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Lisez attentivement chaque question.</strong> Beaucoup de candidats perdent des
                points à cause d&apos;une lecture trop rapide. Prenez les 10 premières secondes pour
                bien identifier ce qui est demandé : une date, un nom, un principe, ou une situation
                pratique à résoudre.
              </p>
              <p>
                <strong>Gérez votre temps.</strong> Vous disposez en moyenne d&apos;une minute par question.
                Si une question vous bloque, marquez-la et passez à la suivante. Vous reviendrez dessus
                à la fin avec le temps restant. Ne laissez jamais une question sans réponse : il n&apos;y a
                pas de pénalité pour une mauvaise réponse.
              </p>
              <p>
                <strong>Entraînez-vous sur les mises en situation.</strong> Elles représentent environ
                30 % des questions et sont souvent les plus piégeuses. Notre section QCM par thématique
                vous permet de les réviser spécifiquement.
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-violet-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>
                <Lightbulb className="w-5 h-5 text-violet-600" />
                Que se passe-t-il après l&apos;examen ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                Si vous obtenez au moins 32/40, vous recevrez une attestation de réussite valable 5 ans,
                à présenter lors de votre demande de titre de séjour. Cette attestation est délivrée
                directement par l&apos;OFII après l&apos;épreuve.
              </p>
              <p>
                En cas d&apos;échec, vous pourrez repasser l&apos;examen lors d&apos;une session ultérieure.
                Nous vous recommandons de consulter nos cours par thématique pour combler vos lacunes
                avant une nouvelle tentative.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
