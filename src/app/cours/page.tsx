"use client";

import React from "react";
import Link from "next/link";
import { allThemes, courses } from "@/lib/qcm-data";
import { THEME_ICONS, THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

export default function CoursPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Cours" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Cours Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Révisez l&apos;intégralité du programme de l&apos;examen civique grâce à nos cours structurés par thématique.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => {
          const themeId = allThemes[idx]?.id || "principes-valeurs";
          const c = THEME_COLORS[themeId];
          return (
            <Link key={course.id} href={`/qcm/theme/${themeId}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[themeId]}</div>
                  <CardTitle className="text-lg group-hover:text-violet-600 transition-colors" style={{ fontFamily: "var(--font-open-sans)" }}>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {course.lessons.slice(0, 3).map((lesson, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600"><BookOpen className="w-4 h-4 text-gray-400 shrink-0" /><span>{lesson}</span></div>
                    ))}
                    {course.lessons.length > 3 && <span className="text-xs text-violet-600 font-medium">+ {course.lessons.length - 3} leçons</span>}
                  </div>
                  <Button variant="outline" className={`w-full ${c.text} border-current text-sm`}>Accéder au cours <ArrowRight className="ml-1 w-4 h-4" /></Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
