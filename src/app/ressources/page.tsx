"use client";

import React from "react";
import { resources } from "@/lib/qcm-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function RessourcesPage() {
  const categories = [...new Set(resources.map(r => r.category))];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Ressources Examen Civique</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Retrouvez toutes les ressources utiles pour comprendre, préparer et réussir l&apos;examen civique.</p>
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.filter(r => r.category === category).map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-400">
                  <CardHeader><CardTitle className="text-base" style={{ fontFamily: "var(--font-open-sans)" }}>{resource.title}</CardTitle><CardDescription className="text-sm">{resource.description}</CardDescription></CardHeader>
                  <CardContent><span className="inline-flex items-center text-sm text-blue-600 font-medium">Lire la suite <ArrowRight className="ml-1 w-4 h-4" /></span></CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
