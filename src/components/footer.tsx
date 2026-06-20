import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { allThemes } from "@/lib/qcm-data";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center"><span className="text-white font-bold text-sm">CP</span></div>
              <span className="font-bold text-white text-lg">CiviquePro</span>
            </div>
            <p className="text-sm leading-relaxed">Préparez-vous à l&apos;examen civique avec nos QCM, cours et examens blancs conformes au programme 2026.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Préparation</h3>
            <ul className="space-y-2">
              <li><Link href="/cours" className="text-sm hover:text-white transition-colors">Cours</Link></li>
              <li><Link href="/examen-blanc" className="text-sm hover:text-white transition-colors">Examen Blanc</Link></li>
              <li><Link href="/annales" className="text-sm hover:text-white transition-colors">Annales</Link></li>
              <li><Link href="/qcm" className="text-sm hover:text-white transition-colors">QCM</Link></li>
              <li><Link href="/questions" className="text-sm hover:text-white transition-colors">Questions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Ressources</h3>
            <ul className="space-y-2">
              <li><Link href="/ressources" className="text-sm hover:text-white transition-colors">Ressources</Link></li>
              <li><span className="text-sm">Conditions générales</span></li>
              <li><span className="text-sm">Politique de confidentialité</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">QCM par thématique</h3>
            <ul className="space-y-2">
              {allThemes.map((theme) => (
                <li key={theme.id}><Link href={`/qcm/theme/${theme.id}`} className="text-sm hover:text-white transition-colors">QCM {theme.shortTitle}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; 2026 CiviquePro. Tous droits réservés.</p>
          <span className="text-xs text-gray-500">Contenu mis à jour pour l&apos;examen civique 2026</span>
        </div>
      </div>
    </footer>
  );
}
