"use client";

import React, { useState, useCallback, useRef } from "react";
import { allThemes, generateFullExam, EXAM_CONFIG, courses, resources, type Question } from "@/lib/qcm-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight, ChevronLeft, Clock, CheckCircle2, XCircle,
  BookOpen, FileText, GraduationCap, Library, MapPin, ArrowRight,
  Timer, Trophy, AlertCircle, Play, RotateCcw, Lightbulb,
  Scale, Landmark, Heart, Menu, X
} from "lucide-react";

// ============================================================
// Types
// ============================================================
type Page = "home" | "qcm" | "qcm-theme" | "qcm-quiz" | "cours" | "examen-blanc" | "examen-blanc-quiz" | "annales" | "questions" | "ressources";

interface NavigationState {
  page: Page;
  themeId?: string;
  serieId?: string;
}

// ============================================================
// Constants
// ============================================================
const NAV_ITEMS = [
  { id: "cours" as const, label: "COURS" },
  { id: "examen-blanc" as const, label: "EXAMEN BLANC" },
  { id: "annales" as const, label: "ANNALES" },
  { id: "qcm" as const, label: "QCM" },
  { id: "questions" as const, label: "QUESTIONS" },
  { id: "ressources" as const, label: "RESSOURCES" },
];

const THEME_ICONS: Record<string, React.ReactNode> = {
  "principes-valeurs": <Landmark className="w-6 h-6" />,
  "droits-devoirs": <Scale className="w-6 h-6" />,
  "histoire-geographie": <MapPin className="w-6 h-6" />,
  "systeme-institutionnel": <GraduationCap className="w-6 h-6" />,
  "vivre-societe": <Heart className="w-6 h-6" />,
};

const THEME_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  "principes-valeurs": { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-600", light: "bg-blue-50" },
  "droits-devoirs": { bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-600", light: "bg-indigo-50" },
  "histoire-geographie": { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-600", light: "bg-amber-50" },
  "systeme-institutionnel": { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
  "vivre-societe": { bg: "bg-rose-600", border: "border-rose-600", text: "text-rose-600", light: "bg-rose-50" },
};

// ============================================================
// Main App
// ============================================================
export default function ExamCiviqueApp() {
  const [nav, setNav] = useState<NavigationState>({ page: "home" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useCallback((page: Page, themeId?: string, serieId?: string) => {
    setNav({ page, themeId, serieId });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header nav={nav} navigate={navigate} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="flex-1">
        {nav.page === "home" && <HomePage navigate={navigate} />}
        {nav.page === "qcm" && <QCMPage navigate={navigate} />}
        {nav.page === "qcm-theme" && nav.themeId && <ThemePage themeId={nav.themeId} navigate={navigate} />}
        {nav.page === "qcm-quiz" && nav.themeId && nav.serieId && <QuizPlayerPage themeId={nav.themeId} serieId={nav.serieId} navigate={navigate} />}
        {nav.page === "cours" && <CoursPage navigate={navigate} />}
        {nav.page === "examen-blanc" && <ExamenBlancPage navigate={navigate} />}
        {nav.page === "examen-blanc-quiz" && <ExamenBlancQuizPage navigate={navigate} />}
        {nav.page === "annales" && <AnnalesPage navigate={navigate} />}
        {nav.page === "questions" && <QuestionsPage />}
        {nav.page === "ressources" && <RessourcesPage />}
      </main>
      <Footer navigate={navigate} />
      <CTABanner navigate={navigate} />
    </div>
  );
}

// ============================================================
// Header
// ============================================================
function Header({ nav, navigate, mobileMenuOpen, setMobileMenuOpen }: {
  nav: NavigationState; navigate: (page: Page) => void; mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">EC</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block" style={{ fontFamily: "var(--font-open-sans)" }}>Examen Civique</span>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  nav.page === item.id || (item.id === "qcm" && nav.page.startsWith("qcm"))
                    ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Se connecter</button>
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg text-left ${nav.page === item.id ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================
// Breadcrumb
// ============================================================
function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-4 h-4 shrink-0" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-blue-600 transition-colors">{item.label}</button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================
// HomePage
// ============================================================
function HomePage({ navigate }: { navigate: (p: Page, t?: string, s?: string) => void }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00182F] via-[#00224A] to-[#0C8E97]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30">Programme 2026 mis à jour</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-open-sans)" }}>
              QCM Examen Civique 2026 gratuits en ligne
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026. 40 questions, 5 thématiques, 45 minutes chrono.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/25" onClick={() => navigate("qcm")}>
                Démarrer un QCM <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-xl" onClick={() => navigate("examen-blanc")}>
                Examen Blanc <Timer className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[{ value: "40", label: "Questions" }, { value: "5", label: "Thématiques" }, { value: "45 min", label: "Chronométré" }, { value: "80%", label: "Pour réussir" }].map((s) => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Series */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>QCM examen civique 2026 - Séries d&apos;entraînement</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choisissez une série complète ou entraînez-vous par thématique pour cibler vos révisions.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {allThemes[0].series.map((serie, idx) => (
            <Card key={serie.id} className="border-2 hover:border-blue-600 transition-colors group cursor-pointer" onClick={() => navigate("qcm-quiz", allThemes[0].id, serie.id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-700">Série n°{idx + 1}</Badge>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>QCM examen civique 2026 - Série n°{idx + 1}</CardTitle>
                <CardDescription>{serie.questions.length} questions conformes au programme officiel, avec corrections détaillées.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Chronométré</span>
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {serie.questions.length} questions</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Corrigé</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold" onClick={() => navigate("qcm")}>
          Voir tous les QCM par thématique <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </section>

      {/* 5 Themes */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Les cinq catégories de QCM examen civique</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Le programme officiel couvre 5 thématiques. Cliquez sur une thématique pour accéder aux QCM.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allThemes.map((theme) => {
              const c = THEME_COLORS[theme.id];
              return (
                <Card key={theme.id} className="cursor-pointer hover:shadow-lg transition-all group border-2" onClick={() => navigate("qcm-theme", theme.id)}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[theme.id]}</div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors" style={{ fontFamily: "var(--font-open-sans)" }}>{theme.title}</CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`${c.light} ${c.text}`}>{theme.questionCount} questions</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Format + Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Quel est le format officiel du QCM examen civique ?</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>L&apos;examen civique est un QCM de 40 questions à choix multiples portant sur 5 thématiques. Il est obligatoire pour les étrangers souhaitant obtenir ou renouveler un titre de séjour en France.</p>
              <p>L&apos;examen dure 45 minutes et se déroule sur ordinateur dans un centre agréé. Le seuil de réussite est fixé à 32 bonnes réponses sur 40, soit 80 %.</p>
              <p>Les questions sont réparties entre connaissances générales et mises en situation pratiques, ces dernières représentant environ 30 % des questions.</p>
            </div>
          </div>
          <Card className="border-2">
            <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>Vue d&apos;ensemble des thématiques</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Thématique</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Questions</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 hidden sm:table-cell">Points de vigilance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allThemes.map((theme) => (
                      <tr key={theme.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <button onClick={() => navigate("qcm-theme", theme.id)} className={`font-medium ${THEME_COLORS[theme.id].text} hover:underline`}>{theme.shortTitle}</button>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">{theme.questionCount}</td>
                        <td className="py-3 px-2 text-gray-500 text-xs hidden sm:table-cell">{theme.pointsVigilance}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-semibold">
                      <td className="py-3 px-2">Total</td>
                      <td className="py-3 px-2 text-center">40</td>
                      <td className="py-3 px-2 text-xs text-blue-700 hidden sm:table-cell">Seuil de réussite : 32/40 (80 %)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "var(--font-open-sans)" }}>Questions fréquentes sur le QCM examen civique</h2>
          <div className="space-y-6">
            {[
              { q: "Les QCM examen civique sont-ils difficiles ?", a: "La difficulté réside principalement dans les mises en situation (12 questions sur 40). Avec une préparation méthodique et un entraînement régulier, le taux de réussite dépasse largement les 90 %." },
              { q: "Comment s'entraîner efficacement avec les QCM ?", a: "Commencez par les thématiques les plus lourdes (Principes et valeurs, Droits et devoirs), entraînez-vous sur les mises en situation, passez des examens blancs complets et révisez les corrections détaillées." },
              { q: "Quelle différence entre QCM et questions officielles ?", a: "Les QCM sont des séries d'entraînement pour réviser par thématique. Les questions officielles sont posées lors de l'examen. Nos QCM sont calqués sur le format officiel et couvrent l'intégralité du programme." },
              { q: "Qui doit s'entraîner sur les QCM examen civique ?", a: "L'examen est obligatoire pour les étrangers de 16 à 65 ans demandant une première carte de résident ou le renouvellement d'un titre de séjour. Le seuil de réussite est de 32/40." }
            ].map((faq, i) => (
              <Card key={i} className="border border-gray-200">
                <CardHeader className="pb-3"><CardTitle className="text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>{faq.q}</CardTitle></CardHeader>
                <CardContent><p className="text-gray-600 leading-relaxed">{faq.a}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// QCM Page
// ============================================================
function QCMPage({ navigate }: { navigate: (p: Page, t?: string, s?: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", onClick: () => navigate("home") }, { label: "QCM" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: "var(--font-open-sans)" }}>QCM Examen Civique 2026 gratuits en ligne</h1>

      {/* All series from all themes */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {allThemes.flatMap(t => t.series).map((serie) => {
          const theme = allThemes.find(t => t.series.some(s => s.id === serie.id))!;
          const c = THEME_COLORS[theme.id];
          return (
            <Card key={serie.id} className="border-2 hover:border-blue-600 transition-all cursor-pointer group" onClick={() => navigate("qcm-quiz", theme.id, serie.id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={`${c.light} ${c.text}`}>{theme.shortTitle}</Badge>
                  <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" /> Chronométré</span>
                </div>
                <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>{serie.title}</CardTitle>
                <CardDescription>{serie.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className={`w-full ${c.bg} hover:opacity-90 text-white font-semibold`}>
                  <Play className="mr-2 w-4 h-4" /> Démarrer
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-12" />

      {/* By Theme */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Les cinq catégories de QCM examen civique</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allThemes.map((theme) => {
          const c = THEME_COLORS[theme.id];
          return (
            <Card key={theme.id} className="cursor-pointer hover:shadow-lg transition-all group border-2" onClick={() => navigate("qcm-theme", theme.id)}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[theme.id]}</div>
                <CardTitle className="text-lg" style={{ fontFamily: "var(--font-open-sans)" }}>QCM {theme.shortTitle}</CardTitle>
                <CardDescription>{theme.questionCount} questions par série - {theme.series.length} séries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">{theme.subThemes.map((st) => (<Badge key={st} variant="secondary" className="text-xs">{st}</Badge>))}</div>
                <Button variant="outline" className={`w-full ${c.text} border-current`}>Accéder aux QCM <ChevronRight className="ml-1 w-4 h-4" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>À quoi servent les QCM examen civique d&apos;entraînement ?</h2>
          <div className="text-gray-600 space-y-3 leading-relaxed">
            <p>Les QCM d&apos;entraînement constituent l&apos;outil le plus efficace pour préparer l&apos;examen civique. Ils permettent de se familiariser avec le format de l&apos;épreuve et d&apos;identifier ses lacunes.</p>
            <p>Nos QCM couvrent l&apos;intégralité du programme officiel et sont conformes à l&apos;arrêté du 10 octobre 2025.</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Les QCM examen civique 2026, en résumé</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, text: "40 questions conformes au programme" },
              { icon: <Clock className="w-5 h-5 text-blue-600" />, text: "45 minutes chronométrées" },
              { icon: <Trophy className="w-5 h-5 text-amber-600" />, text: "Seuil de réussite : 32/40 (80 %)" },
              { icon: <Lightbulb className="w-5 h-5 text-purple-600" />, text: "Corrections détaillées pour chaque question" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">{item.icon}<span className="text-sm font-medium text-gray-700">{item.text}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Theme Detail Page
// ============================================================
function ThemePage({ themeId, navigate }: { themeId: string; navigate: (p: Page, t?: string, s?: string) => void }) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return <div className="p-8 text-center">Thématique non trouvée</div>;
  const c = THEME_COLORS[theme.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", onClick: () => navigate("home") }, { label: "QCM", onClick: () => navigate("qcm") }, { label: theme.title }]} />
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-xl ${c.bg} text-white flex items-center justify-center`}>{THEME_ICONS[theme.id]}</div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>QCM {theme.title}</h1>
          <p className="text-gray-500 mt-1">pour l&apos;examen civique 2026</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {theme.series.map((serie) => (
          <Card key={serie.id} className="border-2 hover:border-blue-500 transition-all group cursor-pointer" onClick={() => navigate("qcm-quiz", theme.id, serie.id)}>
            <CardHeader>
              <Badge className={`w-fit ${c.light} ${c.text}`}>{serie.questions.length} questions</Badge>
              <CardTitle className="text-xl mt-3" style={{ fontFamily: "var(--font-open-sans)" }}>{serie.title}</CardTitle>
              <CardDescription>{serie.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Chronométré</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Corrigé</span>
                </div>
                <Button className={`${c.bg} hover:opacity-90 text-white font-semibold`}><Play className="mr-2 w-4 h-4" /> Démarrer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>À propos des QCM {theme.shortTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed mb-4">{theme.description}</p>
            <div className="space-y-2">{theme.subThemes.map((st) => (<div key={st} className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${c.text}`} /><span className="text-sm text-gray-700">{st}</span></div>))}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader><CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-open-sans)" }}><AlertCircle className="w-5 h-5 text-amber-600" />Points de vigilance</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{theme.pointsVigilance}</p>
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <p className="text-sm text-gray-600"><strong>Conseil :</strong> Entraînez-vous régulièrement sur les mises en situation. Les corrections détaillées vous aideront à comprendre les nuances.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Quiz Player Page (for themed QCM)
// ============================================================
function QuizPlayerPage({ themeId, serieId, navigate }: { themeId: string; serieId: string; navigate: (p: Page, t?: string, s?: string) => void }) {
  const theme = allThemes.find(t => t.id === themeId);
  const serie = theme?.series.find(s => s.id === serieId);
  if (!theme || !serie) return <div className="p-8 text-center">QCM non trouvé</div>;

  return <QuizPlayer questions={serie.questions} title={serie.title} onBack={() => navigate("qcm-theme", themeId)} themeId={themeId} />;
}

// ============================================================
// Generic Quiz Player Component
// ============================================================
function QuizPlayer({ questions, title, onBack, themeId, isExamBlanc = false }: {
  questions: Question[]; title: string; onBack: () => void; themeId?: string; isExamBlanc?: boolean;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(questions.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = themeId ? THEME_COLORS[themeId] : THEME_COLORS["principes-valeurs"];
  const question = questions[currentIdx];
  const selectedAnswer = answers[currentIdx];
  const isAnswered = selectedAnswer !== null;

  // Timer
  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const next = [...answers];
    next[currentIdx] = idx;
    setAnswers(next);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(answers[currentIdx + 1] !== null);
    } else {
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowExplanation(answers[currentIdx - 1] !== null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowExplanation(false);
    setTimeLeft(EXAM_CONFIG.timeLimit);
    setIsFinished(false);
  };

  const correct = answers.filter((a, i) => a === questions[i].correctAnswer).length;
  const incorrect = answers.filter((a) => a !== null).length - correct;
  const timeUsed = EXAM_CONFIG.timeLimit - timeLeft;

  // ==================== RESULTS VIEW ====================
  if (isFinished) {
    const percent = Math.round((correct / questions.length) * 100);
    const passed = percent >= EXAM_CONFIG.passingPercent;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${passed ? "bg-green-100" : "bg-red-100"}`}>
              {passed ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
            </div>
            <CardTitle className="text-2xl mt-4" style={{ fontFamily: "var(--font-open-sans)" }}>
              {passed ? "Félicitations !" : "Continuez vos révisions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{correct}/{questions.length}</div>
            <p className="text-gray-600 mb-6">{percent}% de bonnes réponses {passed ? "— Vous avez réussi !" : "— Seuil requis : 80 %"}</p>
            <Progress value={percent} className={`h-3 mb-6 ${passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} />
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-green-50 rounded-xl"><div className="text-2xl font-bold text-green-600">{correct}</div><div className="text-xs text-gray-600">Correctes</div></div>
              <div className="p-4 bg-red-50 rounded-xl"><div className="text-2xl font-bold text-red-600">{incorrect}</div><div className="text-xs text-gray-600">Incorrectes</div></div>
              <div className="p-4 bg-blue-50 rounded-xl"><div className="text-2xl font-bold text-blue-600">{formatTime(timeUsed)}</div><div className="text-xs text-gray-600">Temps utilisé</div></div>
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <Button variant="outline" onClick={onBack} className="font-semibold"><ChevronLeft className="mr-2 w-4 h-4" /> Retour</Button>
              <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"><RotateCcw className="mr-2 w-4 h-4" /> Recommencer</Button>
            </div>

            {/* Detailed corrections */}
            <Separator className="my-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-left" style={{ fontFamily: "var(--font-open-sans)" }}>Corrections détaillées</h3>
            <div className="space-y-4 text-left max-h-[600px] overflow-y-auto">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                      <p className="text-sm font-medium text-gray-900">Q{i + 1}. {q.text}</p>
                    </div>
                    {!isCorrect && userAnswer !== null && (
                      <p className="text-sm text-red-700 ml-7 mb-1">Votre réponse : {q.options[userAnswer]}</p>
                    )}
                    <p className="text-sm text-green-700 ml-7 mb-2">Bonne réponse : {q.options[q.correctAnswer]}</p>
                    <p className="text-xs text-gray-600 ml-7 leading-relaxed">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== QUIZ VIEW ====================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
            <Clock className="w-4 h-4" /><span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <span className="text-sm text-gray-500 font-medium">{currentIdx + 1}/{questions.length}</span>
        </div>
      </div>

      <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 mb-8 [&>div]:bg-blue-600" />

      <Card className="border-2 mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={question.type === "mise-en-situation" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}>
              {question.type === "mise-en-situation" ? "Mise en situation" : "Connaissance"}
            </Badge>
            <Badge variant="secondary" className={`${colors.light} ${colors.text}`}>Question {currentIdx + 1}</Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed" style={{ fontFamily: "var(--font-open-sans)" }}>{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let optStyle = "border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
              if (isAnswered) {
                if (idx === question.correctAnswer) optStyle = "border-2 border-green-500 bg-green-50 cursor-default";
                else if (idx === selectedAnswer) optStyle = "border-2 border-red-500 bg-red-50 cursor-default";
                else optStyle = "border-2 border-gray-200 opacity-60 cursor-default";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl transition-all ${optStyle}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                      isAnswered && idx === question.correctAnswer ? "bg-green-600 text-white" :
                      isAnswered && idx === selectedAnswer ? "bg-red-600 text-white" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {isAnswered && idx === question.correctAnswer ? <CheckCircle2 className="w-5 h-5" /> :
                       isAnswered && idx === selectedAnswer ? <XCircle className="w-5 h-5" /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-6 p-5 rounded-xl border-2 ${selectedAnswer === question.correctAnswer ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === question.correctAnswer ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Lightbulb className="w-5 h-5 text-amber-600" />}
                <span className={`font-semibold ${selectedAnswer === question.correctAnswer ? "text-green-700" : "text-amber-700"}`}>
                  {selectedAnswer === question.correctAnswer ? "Bonne réponse !" : "Correction"}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} className="font-semibold">
          <ChevronLeft className="mr-1 w-4 h-4" /> Précédent
        </Button>
        <div className="flex gap-1 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => { setCurrentIdx(i); setShowExplanation(answers[i] !== null); }}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                i === currentIdx ? "bg-blue-600 text-white" :
                answers[i] !== null ? (answers[i] === questions[i].correctAnswer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700") :
                "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          {currentIdx === questions.length - 1 ? "Terminer" : "Suivant"} <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Cours Page
// ============================================================
function CoursPage({ navigate }: { navigate: (p: Page, t?: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", onClick: () => navigate("home") }, { label: "Cours" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Cours Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Révisez l&apos;intégralité du programme de l&apos;examen civique grâce à nos cours structurés par thématique.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => {
          const themeId = allThemes[idx]?.id || "principes-valeurs";
          const c = THEME_COLORS[themeId];
          return (
            <Card key={course.id} className="hover:shadow-lg transition-all cursor-pointer group border-2" onClick={() => navigate("qcm-theme", themeId)}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-3`}>{THEME_ICONS[themeId]}</div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors" style={{ fontFamily: "var(--font-open-sans)" }}>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {course.lessons.slice(0, 3).map((lesson, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600"><BookOpen className="w-4 h-4 text-gray-400 shrink-0" /><span>{lesson}</span></div>
                  ))}
                  {course.lessons.length > 3 && <span className="text-xs text-blue-600 font-medium">+ {course.lessons.length - 3} leçons</span>}
                </div>
                <Button variant="outline" className={`w-full ${c.text} border-current text-sm`}>Accéder au cours <ArrowRight className="ml-1 w-4 h-4" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Examen Blanc Page
// ============================================================
function ExamenBlancPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", onClick: () => navigate("home") }, { label: "Examen Blanc" }]} />
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>Examen Blanc Examen Civique 2026</h1>
          <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
            <p>Simulez les conditions réelles de l&apos;examen civique avec notre examen blanc complet. 45 minutes pour répondre à 40 questions couvrant les 5 thématiques.</p>
            <p>L&apos;examen blanc reproduit fidèlement le format : questions de connaissance, mises en situation et seuil de réussite à 80 %.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: <FileText className="w-5 h-5 text-blue-600" />, label: "40 questions", sub: "5 thématiques" },
              { icon: <Clock className="w-5 h-5 text-amber-600" />, label: "45 minutes", sub: "Chronométré" },
              { icon: <Trophy className="w-5 h-5 text-green-600" />, label: "32/40", sub: "Pour réussir" },
              { icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />, label: "Corrigé", sub: "Détaillé" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">{item.icon}<div><div className="font-semibold text-gray-900 text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.sub}</div></div></div>
            ))}
          </div>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/25 w-full sm:w-auto" onClick={() => navigate("examen-blanc-quiz")}>
            <Play className="mr-2 w-5 h-5" /> Démarrer l&apos;examen blanc
          </Button>
        </div>
        <Card className="border-2">
          <CardHeader><CardTitle style={{ fontFamily: "var(--font-open-sans)" }}>Répartition des questions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allThemes.map((theme) => {
                const c = THEME_COLORS[theme.id];
                return (
                  <div key={theme.id}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-700">{theme.shortTitle}</span><span className="text-sm font-bold text-gray-900">{theme.questionCount}</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${c.bg} rounded-full`} style={{ width: `${(theme.questionCount / 40) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm"><span className="font-semibold text-gray-700">Total</span><span className="font-bold text-gray-900">40 questions</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Examen Blanc Quiz (inline - keeps state)
// ============================================================
function ExamenBlancQuizPage({ navigate }: { navigate: (p: Page) => void }) {
  const [questions] = useState(() => generateFullExam());
  return <QuizPlayer questions={questions} title="Examen Blanc - 40 questions" onBack={() => navigate("examen-blanc")} isExamBlanc />;
}

// ============================================================
// Annales Page
// ============================================================
function AnnalesPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", onClick: () => navigate("home") }, { label: "Annales" }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Annales Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Retrouvez les annales des sessions précédentes de l&apos;examen civique pour vous entraîner dans les conditions réelles.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["Session Janvier 2026", "Session Mars 2026", "Session Mai 2026"].map((session, i) => (
          <Card key={i} className="hover:shadow-lg transition-all cursor-pointer group border-2" onClick={() => navigate("examen-blanc-quiz")}>
            <CardHeader>
              <Badge className="bg-blue-100 text-blue-700 w-fit">{session}</Badge>
              <CardTitle className="text-lg mt-2" style={{ fontFamily: "var(--font-open-sans)" }}>Annale {session}</CardTitle>
              <CardDescription>40 questions - 45 minutes - Corrigé inclus</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"><Play className="mr-2 w-4 h-4" /> Commencer</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Questions Page
// ============================================================
function QuestionsPage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const allQuestions = allThemes.flatMap(t => t.series[0].questions.map(q => ({ ...q, themeId: t.id, themeTitle: t.shortTitle })));
  const filteredQuestions = selectedTheme ? allQuestions.filter(q => q.themeId === selectedTheme) : allQuestions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Questions Examen Civique 2026</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Parcourez l&apos;ensemble des questions de l&apos;examen civique, classées par thématique. Chaque question est accompagnée de sa correction.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant={selectedTheme === null ? "default" : "outline"} className={selectedTheme === null ? "bg-blue-600 text-white" : ""} onClick={() => setSelectedTheme(null)}>
          Toutes ({allQuestions.length})
        </Button>
        {allThemes.map((theme) => (
          <Button key={theme.id} variant={selectedTheme === theme.id ? "default" : "outline"} className={selectedTheme === theme.id ? `${THEME_COLORS[theme.id].bg} text-white` : ""} onClick={() => setSelectedTheme(theme.id)}>
            {theme.shortTitle} ({allQuestions.filter(q => q.themeId === theme.id).length})
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredQuestions.map((q, i) => {
          const c = THEME_COLORS[q.themeId];
          const isExpanded = expandedQ === q.id;
          return (
            <Card key={q.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${c.bg} text-white flex items-center justify-center shrink-0 text-sm font-bold`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={q.type === "mise-en-situation" ? "bg-purple-100 text-purple-700 text-xs" : "bg-gray-100 text-gray-700 text-xs"}>
                        {q.type === "mise-en-situation" ? "Mise en situation" : "Connaissance"}
                      </Badge>
                      <Badge variant="secondary" className={`${c.light} ${c.text} text-xs`}>{q.themeTitle}</Badge>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">{q.text}</p>
                    <button onClick={() => setExpandedQ(isExpanded ? null : q.id)} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      {isExpanded ? "Masquer la correction" : "Voir la correction"}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="space-y-1">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`p-2 rounded-lg flex items-start gap-2 text-sm ${idx === q.correctAnswer ? "bg-green-50 border border-green-300" : "bg-gray-50"}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${idx === q.correctAnswer ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {idx === q.correctAnswer ? "✓" : String.fromCharCode(65 + idx)}
                              </span>
                              <span className={idx === q.correctAnswer ? "text-green-800 font-medium" : "text-gray-600"}>{opt}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Ressources Page
// ============================================================
function RessourcesPage() {
  const categories = [...new Set(resources.map(r => r.category))];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Ressources Examen Civique</h1>
      <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">Retrouvez toutes les ressources utiles pour comprendre, préparer et réussir l&apos;examen civique.</p>
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.filter(r => r.category === category).map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-400">
                  <CardHeader><CardTitle className="text-base" style={{ fontFamily: "var(--font-open-sans)" }}>{resource.title}</CardTitle><CardDescription className="text-sm">{resource.description}</CardDescription></CardHeader>
                  <CardContent><span className="inline-flex items-center text-sm text-blue-600 font-medium">Lire la suite <ArrowRight className="ml-1 w-4 h-4" /></span></CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CTA Banner
// ============================================================
function CTABanner({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <section className="bg-gradient-to-r from-[#00182F] to-[#00224A] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-open-sans)" }}>Démarrez votre préparation à l&apos;examen civique dès aujourd&apos;hui !</h2>
        <p className="text-gray-300 mb-6">Accédez gratuitement à nos QCM, cours et examens blancs pour réussir votre examen civique du premier coup.</p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-bold rounded-xl" onClick={() => navigate("qcm")}>
          Je démarre GRATUITEMENT <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer({ navigate }: { navigate: (p: Page, t?: string) => void }) {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"><span className="text-white font-bold text-sm">EC</span></div>
              <span className="font-bold text-white text-lg">Examen Civique</span>
            </div>
            <p className="text-sm leading-relaxed">Préparez-vous à l&apos;examen civique avec nos QCM, cours et examens blancs conformes au programme 2026.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Préparation</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate("cours")} className="text-sm hover:text-white transition-colors">Cours</button></li>
              <li><button onClick={() => navigate("examen-blanc")} className="text-sm hover:text-white transition-colors">Examen Blanc</button></li>
              <li><button onClick={() => navigate("annales")} className="text-sm hover:text-white transition-colors">Annales</button></li>
              <li><button onClick={() => navigate("qcm")} className="text-sm hover:text-white transition-colors">QCM</button></li>
              <li><button onClick={() => navigate("questions")} className="text-sm hover:text-white transition-colors">Questions</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Ressources</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate("ressources")} className="text-sm hover:text-white transition-colors">Ressources</button></li>
              <li><span className="text-sm">Conditions générales</span></li>
              <li><span className="text-sm">Politique de confidentialité</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">QCM par thématique</h3>
            <ul className="space-y-2">
              {allThemes.map((theme) => (
                <li key={theme.id}><button onClick={() => navigate("qcm-theme", theme.id)} className="text-sm hover:text-white transition-colors">QCM {theme.shortTitle}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Examen Civique. Tous droits réservés.</p>
          <span className="text-xs text-gray-500">Contenu mis à jour pour l&apos;EXAMEN CIVIQUE de 2026</span>
        </div>
      </div>
    </footer>
  );
}
