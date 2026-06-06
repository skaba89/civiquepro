import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-slate-900 to-violet-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Démarrez votre préparation à l&apos;examen civique dès aujourd&apos;hui !</h2>
        <p className="text-gray-300 mb-6">Accédez gratuitement à nos QCM, cours et examens blancs pour réussir votre examen civique du premier coup.</p>
        <Link href="/qcm">
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg font-bold rounded-xl">
            Je démarre GRATUITEMENT <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
