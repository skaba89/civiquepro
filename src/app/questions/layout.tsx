import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions Examen Civique 2026 - CiviquePro",
  description: "Parcourez toutes les questions de l'examen civique classées par thématique. Filtrez par thème et type pour réviser efficacement.",
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
