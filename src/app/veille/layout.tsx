import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veille IA - CiviquePro",
  description: "Tableau de bord de veille IA pour suivre les évolutions législatives et gouvernementales impactant l'examen civique français.",
};

export default function VeilleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
