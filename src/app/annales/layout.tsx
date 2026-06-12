import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annales Examen Civique 2026 - CiviquePro",
  description: "Retrouvez les annales des sessions précédentes de l'examen civique. Entraînez-vous sur les sujets réels pour maximiser vos chances de réussite.",
};

export default function AnnalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
