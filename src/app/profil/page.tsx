import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = {
  title: "Mon Profil - CiviquePro",
  description:
    "Suivez votre progression, consultez votre historique de QCM et gérez vos paramètres de compte CiviquePro.",
  robots: { index: false, follow: false }, // Private page — don't index
};

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Mon Profil" }]} />
      {/* SSR-rendered h1 for SEO & accessibility — visible until JS hydrates,
          then ProfileContent replaces it with the actual user name */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: "var(--font-open-sans)" }}
      >
        Mon Profil
      </h1>
      <ProfileContent />
    </div>
  );
}
