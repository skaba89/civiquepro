import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { BackButton } from "./not-found-back-button";

export const metadata: Metadata = {
  title: "Page introuvable (404)",
  description: "La page que vous recherchez n'existe pas ou a été déplacée.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-8xl font-extrabold text-violet-200 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Cette page est introuvable
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
        Vérifiez l&apos;adresse ou retournez à l&apos;accueil.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold">
            <Home className="w-4 h-4 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </Link>
        <BackButton />
      </div>
    </div>
  );
}
