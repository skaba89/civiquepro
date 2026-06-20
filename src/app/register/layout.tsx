import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Inscrivez-vous gratuitement sur CiviquePro pour accéder aux QCM d'examen civique 2026 et suivre votre progression.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
