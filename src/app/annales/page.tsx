"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

export default function AnnalesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Annales" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Annales Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Retrouvez les annales des sessions précédentes de l&apos;examen civique pour vous entraîner dans les conditions réelles.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["Session Janvier 2026", "Session Mars 2026", "Session Mai 2026"].map((session, i) => (
          <Link key={i} href="/examen-blanc/quiz">
            <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 h-full">
              <CardHeader>
                <Badge className="bg-violet-100 text-violet-700 w-fit">{session}</Badge>
                <CardTitle className="text-lg mt-2" style={{ fontFamily: "var(--font-open-sans)" }}>Annale {session}</CardTitle>
                <CardDescription>40 questions - 45 minutes - Corrigé inclus</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"><Play className="mr-2 w-4 h-4" /> Commencer</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
