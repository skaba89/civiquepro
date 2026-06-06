"use client";

import React from "react";
import Link from "next/link";
import { allThemes } from "@/lib/qcm-data";
import { THEME_ICONS, THEME_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock, CheckCircle2, XCircle,
  FileText, ArrowRight,
  Timer, Trophy, Lightbulb,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900 to-violet-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30">Programme 2026 mis à jour</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-open-sans)" }}>
              QCM Examen Civique 2026 gratuits en ligne
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026. 40 questions, 5 thématiques, 45 minutes chrono.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/qcm">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-violet-600/25">
                  Démarrer un QCM <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/examen-blanc">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-xl">
                  Examen Blanc <Timer className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[{ value: "40", label: "Questions" }, { value: "5", label: "Thématiques" }, { value: "45 min", label: "Chronométré" }, { value: "80%", label: "Pour réussir" }].map((s) => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Series */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>QCM examen civique 2026 - Séries d&apos;entraînement</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choisissez une série complète ou entraînez-vous par thématique pour cibler vos révisions.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {allThemes[0].series.map((serie, idx) => (
            <Link key={serie.id} href={`/qcm/quiz/${allThemes[0].id}/${serie.id}`}>
              <Card className="border-2 hover:border-violet-600 transition-colors group cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-violet-100 text-violet-700">Série n°{idx + 1}</Badge>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>QCM examen civique 2026 - Série n°{idx + 1}</CardTitle>
                  <CardDescription>{serie.questions.length} questions conformes au programme officiel, avec corrections détaillées.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Chronométré</span>
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {serie.questions.length} questions</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Corrigé</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link href="/qcm">
          <Button variant="outline" className="w-full text-violet-600 border-violet-200 hover:bg-violet-50 font-semibold">
            Voir tous les QCM par thématique <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* 5 Themes */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Les cinq catégories de QCM examen civique</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Le programme officiel couvre 5 thématiques. Cliquez sur une thématique pour accéder aux QCM.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allThemes.map((theme) => {
              const c = THEME_COLORS[theme.id];
              return (
                <Link key={theme.id} href={`/qcm/theme/${theme.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all group border-2 h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[theme.id]}</div>
                      <CardTitle className="text-lg group-hover:text-violet-600 transition-colors" style={{ fontFamily: "var(--font-open-sans)" }}>{theme.title}</CardTitle>
                      <CardDescription>{theme.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`${c.light} ${c.text}`}>{theme.questionCount} questions</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Format + Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Quel est le format officiel du QCM examen civique ?</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>L&apos;examen civique est un QCM de 40 questions à choix multiples portant sur 5 thématiques. Il est obligatoire pour les étrangers souhaitant obtenir ou renouveler un titre de séjour en France.</p>
              <p>L&apos;examen dure 45 minutes et se déroule sur ordinateur dans un centre agréé. Le seuil de réussite est fixé à 32 bonnes réponses sur 40, soit 80 %.</p>
              <p>Les questions sont réparties entre connaissances générales et mises en situation pratiques, ces dernières représentant environ 30 % des questions.</p>
            </div>
          </div>
          <Card className="border-2">
            <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>Vue d&apos;ensemble des thématiques</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Thématique</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Questions</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 hidden sm:table-cell">Points de vigilance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allThemes.map((theme) => (
                      <tr key={theme.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <Link href={`/qcm/theme/${theme.id}`} className={`font-medium ${THEME_COLORS[theme.id].text} hover:underline`}>{theme.shortTitle}</Link>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">{theme.questionCount}</td>
                        <td className="py-3 px-2 text-gray-500 text-xs hidden sm:table-cell">{theme.pointsVigilance}</td>
                      </tr>
                    ))}
                    <tr className="bg-violet-50 font-semibold">
                      <td className="py-3 px-2">Total</td>
                      <td className="py-3 px-2 text-center">40</td>
                      <td className="py-3 px-2 text-xs text-violet-700 hidden sm:table-cell">Seuil de réussite : 32/40 (80 %)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "var(--font-open-sans)" }}>Questions fréquentes sur le QCM examen civique</h2>
          <div className="space-y-6">
            {[
              { q: "Les QCM examen civique sont-ils difficiles ?", a: "La difficulté réside principalement dans les mises en situation (12 questions sur 40). Avec une préparation méthodique et un entraînement régulier, le taux de réussite dépasse largement les 90 %." },
              { q: "Comment s'entraîner efficacement avec les QCM ?", a: "Commencez par les thématiques les plus lourdes (Principes et valeurs, Droits et devoirs), entraînez-vous sur les mises en situation, passez des examens blancs complets et révisez les corrections détaillées." },
              { q: "Quelle différence entre QCM et questions officielles ?", a: "Les QCM sont des séries d'entraînement pour réviser par thématique. Les questions officielles sont posées lors de l'examen. Nos QCM sont calqués sur le format officiel et couvrent l'intégralité du programme." },
              { q: "Qui doit s'entraîner sur les QCM examen civique ?", a: "L'examen est obligatoire pour les étrangers de 16 à 65 ans demandant une première carte de résident ou le renouvellement d'un titre de séjour. Le seuil de réussite est de 32/40." }
            ].map((faq, i) => (
              <Card key={i} className="border border-gray-200">
                <CardHeader className="pb-3"><CardTitle className="text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>{faq.q}</CardTitle></CardHeader>
                <CardContent><p className="text-gray-600 leading-relaxed">{faq.a}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
