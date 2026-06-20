"use client";

import React from "react";
import Link from "next/link";
import { allThemes, courses } from "@/lib/qcm-data";
import { THEME_ICONS, THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, ArrowRight, Clock, GraduationCap } from "lucide-react";

export default function CoursPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Cours" }]} />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>
        Cours Examen Civique 2026
      </h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">
        Révisez l&apos;intégralité du programme de l&apos;examen civique grâce à nos cours structurés
        par thématique. Chaque cours couvre les notions essentielles, les textes de loi de référence
        et les pièges classiques à connaître pour réussir l&apos;épreuve de l&apos;OFII.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {courses.map((course, idx) => {
          const themeId = allThemes[idx]?.id || "principes-valeurs";
          const c = THEME_COLORS[themeId];
          return (
            <Link key={course.id} href={`/qcm/theme/${themeId}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>
                    {THEME_ICONS[themeId]}
                  </div>
                  <CardTitle className="text-lg group-hover:text-violet-600 transition-colors" style={{ fontFamily: "var(--font-open-sans)" }}>
                    {course.title}
                  </CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {course.lessons.slice(0, 3).map((lesson, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{lesson}</span>
                      </div>
                    ))}
                    {course.lessons.length > 3 && (
                      <span className="text-xs text-violet-600 font-medium">
                        + {course.lessons.length - 3} leçons supplémentaires
                      </span>
                    )}
                  </div>
                  <Button variant="outline" className={`w-full ${c.text} border-current text-sm`}>
                    Accéder aux QCM <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "var(--font-open-sans)" }}>
              <GraduationCap className="w-5 h-5 text-violet-600" />
              Méthodologie de révision recommandée
            </CardTitle>
            <CardDescription>
              Pour maximiser vos chances de réussite à l&apos;examen civique, nous vous recommandons
              une approche structurée en trois étapes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Étape 1 — Apprentissage théorique (1 à 2 semaines).</strong> Commencez par
              parcourir l&apos;intégralité des cours par thématique, dans l&apos;ordre proposé. Lisez
              attentivement chaque leçon, prenez des notes sur les dates clés, les noms importants,
              et les principes juridiques fondamentaux. À ce stade, l&apos;objectif n&apos;est pas de
              tout mémoriser mais de comprendre la logique d&apos;ensemble et de familiariser votre
              cerveau avec le vocabulaire juridique et institutionnel français.
            </p>
            <p>
              <strong>Étape 2 — Entraînement ciblé par QCM (2 à 3 semaines).</strong> Une fois les
              cours assimilés, passez aux QCM par thématique. L&apos;idéal est de réaliser au moins
              une série complète par thématique, puis de revenir sur les notions mal maîtrisées en
              relisant le cours correspondant. N&apos;hésitez pas à passer plusieurs fois le même QCM
              jusqu&apos;à obtenir un score supérieur à 90 % de façon stable.
            </p>
            <p>
              <strong>Étape 3 — Simulation en conditions réelles (dernière semaine).</strong> Enfin,
              terminez votre préparation par un ou plusieurs examens blancs complets. Cette étape vous
              permet de vérifier votre endurance sur la durée (45 minutes), de gérer votre stress et
              de valider que vous êtes prêt pour le jour J. Si votre score est inférieur à 32/40,
              identifiez les thématiques qui vous font perdre le plus de points et retournez aux
              cours correspondants.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>
              <Clock className="w-5 h-5 text-amber-600" />
              Combien de temps prévoir ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              La durée de préparation idéale dépend de votre niveau initial. Pour une personne
              francophone ayant déjà des bases en culture générale française, 4 à 6 semaines de
              révision à raison de 2 heures par jour suffisent généralement.
            </p>
            <p>
              Si vous découvrez entièrement le programme ou si le français n&apos;est pas votre langue
              maternelle, prévoyez plutôt 8 à 12 semaines. L&apos;important est de progresser
              régulièrement plutôt que de tout réviser à la dernière minute.
            </p>
            <p>
              Dans tous les cas, espacez vos sessions de révision : il vaut mieux étudier 1 heure
              par jour pendant 2 mois que 14 heures par jour pendant 4 jours. La mémorisation
              long-terme se construit par la répétition espacée.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-br from-violet-50 to-orange-50 border border-violet-200 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: "var(--font-open-sans)" }}>
          Les 5 thématiques officielles de l&apos;examen civique
        </h2>
        <p className="text-gray-600 text-center mb-6 max-w-3xl mx-auto leading-relaxed">
          Le programme officiel publié par l&apos;OFII couvre 5 grandes thématiques. Chacune est
          évaluée à parts roughly égales lors de l&apos;examen, ce qui signifie qu&apos;aucun domaine
          ne peut être négligé. Découvrez ci-dessous les points clés de chaque thématique.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {allThemes.map((theme) => {
            const c = THEME_COLORS[theme.id];
            return (
              <Link
                key={theme.id}
                href={`/qcm/theme/${theme.id}`}
                className="bg-white rounded-xl p-4 border-2 hover:shadow-md transition-all text-center group"
              >
                <div className={`w-10 h-10 rounded-lg ${c.bg} text-white flex items-center justify-center mx-auto mb-2`}>
                  {THEME_ICONS[theme.id]}
                </div>
                <div className="font-semibold text-sm text-gray-900 group-hover:text-violet-600 transition-colors">
                  {theme.shortTitle}
                </div>
                <div className="text-xs text-gray-500 mt-1">{theme.questionCount} questions</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
