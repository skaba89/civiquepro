"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console (Sentry/external monitoring can be wired here in prod)
    console.error("App error captured by error.tsx:", error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 mb-6">
        <AlertTriangle className="w-8 h-8 text-orange-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Une erreur est survenue
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Désolé, une erreur inattendue s&apos;est produite. Vous pouvez réessayer
        ou retourner à l&apos;accueil.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="bg-gray-100 text-gray-700 text-xs text-left p-4 rounded-md mb-6 overflow-auto max-w-md mx-auto">
          {error.message}
        </pre>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={reset}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
        <Link href="/">
          <Button variant="outline" className="font-semibold">
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
