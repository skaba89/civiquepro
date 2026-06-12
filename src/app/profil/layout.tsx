import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Profil - CiviquePro",
  description: "Consultez vos résultats, suivez votre progression et gérez vos paramètres de compte CiviquePro.",
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
