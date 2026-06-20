"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Calendar, AlertCircle } from "lucide-react";

export default function AnnalesPage() {
  const sessions = [
    {
      name: "Session Janvier 2026",
      difficulty: "Intermédiaire",
      topics: "Principes de la République, Laïcité, Symboles",
      questionsCount: 40,
      duration: "45 min",
    },
    {
      name: "Session Mars 2026",
      difficulty: "Avancé",
      topics: "Droits sociaux, Libertés fondamentales, Institutions",
      questionsCount: 40,
      duration: "45 min",
    },
    {
      name: "Session Mai 2026",
      difficulty: "Standard",
      topics: "Histoire, Géographie, Vie quotidienne",
      questionsCount: 40,
      duration: "45 min",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Annales" }]} />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>
        Annales Examen Civique 2026
      </h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">
        Retrouvez les annales des sessions précédentes de l&apos;examen civique pour vous entraîner
        dans les conditions réelles. Chaque annale est une copie conforme du QCM officiel administré
        par l&apos;OFII, avec correction détaillée et explications juridiques.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sessions.map((session) => (
          <Link key={session.name} href="/examen-blanc/quiz">
            <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-violet-100 text-violet-700 w-fit">{session.name}</Badge>
                  <Badge variant="outline" className="text-xs">{session.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg mt-1" style={{ fontFamily: "var(--font-open-sans)" }}>
                  Annale {session.name}
                </CardTitle>
                <CardDescription>
                  {session.questionsCount} questions · {session.duration} · Corrigé inclus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-2">{session.topics}</span>
                </div>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold">
                  <Play className="mr-2 w-4 h-4" /> Commencer cette annale
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "var(--font-open-sans)" }}>
              <Calendar className="w-5 h-5 text-violet-600" />
              Comment utiliser les annales efficacement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Les annales constituent l&apos;outil de révision le plus fidèle à l&apos;examen réel. Nous
              recommandons de les utiliser en fin de préparation, après avoir étudié les cours par
              thématique et passé quelques QCM d&apos;entraînement ciblés. Cela vous permet d&apos;évaluer
              votre niveau global et d&apos;identifier les dernières lacunes à combler.
            </p>
            <p>
              Pour tirer le meilleur parti de chaque session, passez l&apos;annale en conditions réelles :
              isolez-vous, activez le chronomètre, ne consultez ni vos notes ni internet. Une fois
              l&apos;épreuve terminée, prenez le temps de lire attentivement la correction complète, y
              compris pour les questions que vous avez réussies. Cette étape est cruciale pour
              ancrer durablement les connaissances juridiques et repérer les pièges récurrents.
            </p>
            <p>
              Enfin, espacez vos passages d&apos;annales sur plusieurs jours plutôt que de les enchaîner.
              Votre cerveau consolide les informations pendant le sommeil, et une bonne nuit après
              une session d&apos;entraînement améliore significativement la rétention des connaissances
              juridiques à long terme.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "var(--font-open-sans)" }}>
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Important à savoir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Les annales disponibles sur cette page sont des reconstitutions fidèles du format
              officiel, calquées sur le programme publié par l&apos;OFII pour l&apos;année 2026. Elles ne
              reproduisent pas exactement les questions posées lors des sessions réelles, car celles-ci
              restent confidentielles, mais elles en respectent scrupuleusement le niveau, la
              répartition thématique et la formulation.
            </p>
            <p>
              Le programme officiel de l&apos;examen civique peut être légèrement ajusté chaque année
              en fonction des évolutions législatives (nouvelles lois, remaniements gouvernementaux,
              jurisprudence récente). Notre veille IA met à jour régulièrement les questions pour
              refléter ces changements, garantissant ainsi que vous vous entraînez sur un contenu
              toujours conforme à l&apos;actualité juridique française.
            </p>
            <p>
              Pour maximiser vos chances de réussite, complétez votre entraînement sur les annales
              par une lecture approfondie de la <strong>Charte des droits et devoirs</strong> et du
              document <strong>&quot;Livret du citoyen&quot;</strong> édité par l&apos;OFII, qui constituent
              les deux sources officielles principales de l&apos;examen.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-open-sans)" }}>
          Prêt à évaluer votre niveau ?
        </h2>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Lancez-vous sur l&apos;une des annales ci-dessus, ou commencez par un examen blanc complet
          pour tester votre endurance sur la durée complète de 45 minutes.
        </p>
        <Link href="/examen-blanc">
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold">
            Passer un examen blanc complet
          </Button>
        </Link>
      </div>
    </div>
  );
}
