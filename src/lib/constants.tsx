import React from "react";
import {
  Landmark, Scale, MapPin, GraduationCap, Heart,
} from "lucide-react";

// ============================================================
// Navigation Items
// ============================================================
export const NAV_ITEMS = [
  { id: "cours" as const, label: "COURS", href: "/cours" },
  { id: "examen-blanc" as const, label: "EXAMEN BLANC", href: "/examen-blanc" },
  { id: "annales" as const, label: "ANNALES", href: "/annales" },
  { id: "qcm" as const, label: "QCM", href: "/qcm" },
  { id: "questions" as const, label: "QUESTIONS", href: "/questions" },
  { id: "ressources" as const, label: "RESSOURCES", href: "/ressources" },
  { id: "veille" as const, label: "VEILLE IA", href: "/veille" },
];

// ============================================================
// Theme Icons
// ============================================================
export const THEME_ICONS: Record<string, React.ReactNode> = {
  "principes-valeurs": <Landmark className="w-6 h-6" />,
  "droits-devoirs": <Scale className="w-6 h-6" />,
  "histoire-geographie": <MapPin className="w-6 h-6" />,
  "systeme-institutionnel": <GraduationCap className="w-6 h-6" />,
  "vivre-societe": <Heart className="w-6 h-6" />,
};

// ============================================================
// Theme Colors
// ============================================================
export const THEME_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  "principes-valeurs": { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-600", light: "bg-blue-50" },
  "droits-devoirs": { bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-600", light: "bg-indigo-50" },
  "histoire-geographie": { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-600", light: "bg-amber-50" },
  "systeme-institutionnel": { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
  "vivre-societe": { bg: "bg-rose-600", border: "border-rose-600", text: "text-rose-600", light: "bg-rose-50" },
};
