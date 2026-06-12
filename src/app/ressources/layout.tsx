import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ressources Examen Civique - CiviquePro",
  description: "Toutes les ressources pour comprendre, préparer et réussir l'examen civique : guides, liens utiles, conseils pratiques et mémentos.",
};

export default function RessourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
