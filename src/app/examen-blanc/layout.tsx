import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Examen Blanc Civique 2026 - CiviquePro",
  description: "Simulez les conditions réelles de l'examen civique avec notre examen blanc. 40 questions en 45 minutes, 5 thématiques, score immédiat.",
};

export default function ExamenBlancLayout({ children }: { children: React.ReactNode }) {
  return children;
}
