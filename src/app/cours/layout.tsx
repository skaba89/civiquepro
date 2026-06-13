import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cours Examen Civique 2026 - CiviquePro",
  description: "Révisez le programme complet de l'examen civique avec nos cours structurés par thématique. Principes, droits, organisation, engagez-vous et histoire de France.",
};

export default function CoursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
