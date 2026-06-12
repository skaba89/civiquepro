"use client";

import React, { useState } from "react";
import { allThemes } from "@/lib/qcm-data";
import { THEME_COLORS } from "@/lib/constants";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, CheckCircle2, XCircle,
  FileText, ArrowRight,
  Lightbulb, Bot, Shield,
  Zap, Eye, ThumbsUp, ThumbsDown, Globe, FileCheck, Users,
  RefreshCw, Scale, Landmark, Clock, Calendar, Activity,
  Bell, Newspaper, Building2,
} from "lucide-react";

interface VeilleStatus {
  status: string;
  lastSearch: string | null;
  lastGovernmentUpdate: string | null;
  stats: {
    totalUpdates: number;
    pendingSuggestions: number;
    approvedSuggestions: number;
    appliedSuggestions: number;
    totalGovernmentMembers: number;
  };
  updatesByCategory: Array<{ category: string; count: number }>;
  updatesByImpact: Array<{ impact: string; count: number }>;
  recentUpdates: Array<{
    id: string; title: string; description: string; category: string; impact: string; status: string;
    createdAt: string; suggestions: Array<{ id: string; status: string; suggestedData: string; themeId: string; reason: string }>;
  }>;
  recentLogs: Array<{ id: string; action: string; status: string; details: string | null; resultsCount: number; duration: number; createdAt: string }>;
}

interface GovMember { name: string; role: string; ministry: string; }

export default function VeilleIAPage() {
  const [status, setStatus] = useState<VeilleStatus | null>(null);
  const [govMembers, setGovMembers] = useState<GovMember[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "suggestions" | "government" | "digest" | "logs">("dashboard");
  const [cronStatus, setCronStatus] = useState<{ hoursSinceLastRun: number; veilleRecommended: boolean; lastCronRun: string | null } | null>(null);
  const [digest, setDigest] = useState<Record<string, unknown> | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/veille/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Erreur fetch status:", err);
    }
  };

  const fetchGovernment = async () => {
    try {
      const res = await fetch("/api/veille/government");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.members) setGovMembers(data.members);
    } catch (err) {
      console.error("Erreur fetch government:", err);
    }
  };

  React.useEffect(() => { fetchStatus(); fetchGovernment(); fetchCronStatus(); }, []);

  const fetchCronStatus = async () => {
    try {
      const res = await fetch("/api/veille/cron");
      if (res.ok) {
        const data = await res.json();
        setCronStatus(data);
      }
    } catch { /* ignore */ }
  };

  const handleFullVeille = async () => {
    setLoading("cron");
    setSearchResult(null);
    try {
      const res = await fetch("/api/veille/cron", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSearchResult(data);
      await fetchStatus();
      await fetchGovernment();
      await fetchCronStatus();
    } catch (err) {
      console.error("Erreur veille auto:", err);
      setSearchResult({ status: "error", message: "Erreur lors de la veille automatique" });
    } finally {
      setLoading(null);
    }
  };

  const handleDigest = async () => {
    setLoading("digest");
    try {
      const res = await fetch("/api/veille/digest");
      if (res.ok) {
        const data = await res.json();
        setDigest(data);
      }
    } catch (err) {
      console.error("Erreur digest:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleSearch = async () => {
    setLoading("search");
    setSearchResult(null);
    try {
      const res = await fetch("/api/veille/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSearchResult(data);
      await fetchStatus();
    } catch (err) {
      console.error("Erreur search:", err);
      setSearchResult({ status: "error", message: "Erreur lors de la recherche" });
    } finally {
      setLoading(null);
    }
  };

  const handleGovUpdate = async () => {
    setLoading("government");
    try {
      const res = await fetch("/api/veille/government", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      await fetchGovernment();
      await fetchStatus();
      setSearchResult(data);
    } catch (err) {
      console.error("Erreur government update:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleApplySuggestion = async (suggestionId: string, action: "approve" | "reject") => {
    try {
      await fetch("/api/veille/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, action }),
      });
      await fetchStatus();
    } catch (err) {
      console.error("Erreur apply suggestion:", err);
    }
  };

  const categoryLabels: Record<string, string> = {
    loi: "Loi", circulaire: "Circulaire", decret: "Décret",
    gouvernement: "Gouvernement", jurisprudence: "Jurisprudence", institutionnel: "Institutionnel",
    administratif: "Administratif"
  };
  const impactColors: Record<string, { bg: string; text: string }> = {
    low: { bg: "bg-gray-100", text: "text-gray-700" },
    medium: { bg: "bg-amber-100", text: "text-amber-700" },
    high: { bg: "bg-orange-100", text: "text-orange-700" },
    critical: { bg: "bg-red-100", text: "text-red-700" },
  };
  const statusColors: Record<string, { bg: string; text: string }> = {
    detected: { bg: "bg-violet-100", text: "text-violet-700" },
    analyzed: { bg: "bg-amber-100", text: "text-amber-700" },
    applied: { bg: "bg-green-100", text: "text-green-700" },
    ignored: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Jamais";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Collect all pending suggestions from recent updates
  const allPendingSuggestions: Array<{
    id: string; status: string; suggestedData: string; themeId: string; reason: string;
    updateTitle: string; updateId: string; updateCategory: string;
  }> = status?.recentUpdates.flatMap(u =>
    u.suggestions.map(s => ({ ...s, updateTitle: u.title, updateId: u.id, updateCategory: u.category }))
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Veille IA" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-orange-400 text-white flex items-center justify-center">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>Veille IA - Surveillance juridique</h1>
            <p className="text-gray-500 mt-1">Mise à jour automatique des QCM selon les dernières lois et circulaires</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {(() => {
        const totalUpdates = status?.stats.totalUpdates || 0;
        const pendingSuggestions = status?.stats.pendingSuggestions || 0;
        const appliedQuestions = (status?.stats.approvedSuggestions ?? 0) + (status?.stats.appliedSuggestions ?? 0);
        const govMembers = status?.stats.totalGovernmentMembers || 0;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-violet-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><Eye className="w-5 h-5 text-violet-600" /><span className="text-xs text-gray-500">Changements détectés</span></div>
              <div className="text-2xl font-bold text-gray-900">{totalUpdates}</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-amber-600" /><span className="text-xs text-gray-500">Suggestions en attente</span></div>
              <div className="text-2xl font-bold text-gray-900">{pendingSuggestions}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="text-xs text-gray-500">Questions appliquées</span></div>
              <div className="text-2xl font-bold text-gray-900">{appliedQuestions}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-purple-600" /><span className="text-xs text-gray-500">Membres du gouvernement</span></div>
              <div className="text-2xl font-bold text-gray-900">{govMembers}</div>
            </div>
          </div>
        );
      })()}

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {/* Veille automatique complète */}
        <Card className="border-2 hover:border-orange-400 transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-violet-50" onClick={handleFullVeille}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-violet-600 text-white flex items-center justify-center shrink-0">
                {loading === "cron" ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">Veille automatique</h3>
                  {cronStatus?.veilleRecommended && (
                    <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                      <Bell className="w-3 h-3 mr-1" />Recommandée
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">Scan complet : lois, gouvernement, sources officielles</p>
                <p className="text-xs text-gray-400 mt-1">
                  {cronStatus?.lastCronRun
                    ? `Dernière veille : il y a ${cronStatus.hoursSinceLastRun}h`
                    : "Jamais exécutée"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Recherche web simple */}
        <Card className="border-2 hover:border-violet-400 transition-all cursor-pointer" onClick={handleSearch}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                {loading === "search" ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Globe className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Recherche web</h3>
                <p className="text-sm text-gray-500">Lois, circulaires et réformes</p>
                <p className="text-xs text-gray-400 mt-1">Dernière : {formatDate(status?.lastSearch ?? null)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        {/* Gouvernement */}
        <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer" onClick={handleGovUpdate}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                {loading === "government" ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Gouvernement</h3>
                <p className="text-sm text-gray-500">Membres actuels du gouvernement</p>
                <p className="text-xs text-gray-400 mt-1">Dernière màj : {formatDate(status?.lastGovernmentUpdate ?? null)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Result */}
      {searchResult && (
        <Card className="mb-8 border-2 border-violet-200 bg-violet-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-violet-600" />
              Résultat de la dernière action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-60 bg-white p-4 rounded-lg border">
              {JSON.stringify(searchResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
        <button onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === "dashboard" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          <Eye className="w-4 h-4" />Changements
        </button>
        <button onClick={() => setActiveTab("suggestions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === "suggestions" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          <Lightbulb className="w-4 h-4" />Suggestions IA
          {status?.stats.pendingSuggestions ? (
            <Badge className="bg-orange-100 text-orange-700 text-xs ml-1">{status.stats.pendingSuggestions}</Badge>
          ) : null}
        </button>
        <button onClick={() => { setActiveTab("government"); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === "government" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          <Users className="w-4 h-4" />Gouvernement
        </button>
        <button onClick={() => { setActiveTab("digest"); handleDigest(); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === "digest" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          <Newspaper className="w-4 h-4" />Résumé hebdo
        </button>
        <button onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === "logs" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          <FileCheck className="w-4 h-4" />Journal
        </button>
      </div>

      {/* Tab: Changements détectés */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {status?.recentUpdates.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucun changement détecté</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">Lancez une recherche web pour identifier les dernières évolutions juridiques, lois, circulaires et remaniements gouvernementaux.</p>
              </CardContent>
            </Card>
          ) : (
            status?.recentUpdates.map((update) => {
              const impColor = impactColors[update.impact] || impactColors.medium;
              const statColor = statusColors[update.status] || statusColors.detected;
              return (
                <Card key={update.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${impColor.bg} ${impColor.text} flex items-center justify-center shrink-0 text-sm font-bold`}>
                        {update.impact === "critical" ? <Zap className="w-5 h-5" /> :
                         update.impact === "high" ? <AlertCircle className="w-5 h-5" /> :
                         <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          <Badge className={`${statColor.bg} ${statColor.text} text-xs`}>{update.status}</Badge>
                          <Badge className={`${impColor.bg} ${impColor.text} text-xs`}>{update.impact}</Badge>
                          <Badge variant="secondary" className="text-xs">{categoryLabels[update.category] || update.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{update.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(update.createdAt)}</p>
                        {update.suggestions.length > 0 && (
                          <p className="text-xs text-violet-600 font-medium mt-2">
                            {update.suggestions.length} suggestion(s) de questions
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Suggestions IA */}
      {activeTab === "suggestions" && (
        <div className="space-y-4">
          {allPendingSuggestions.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucune suggestion en attente</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">Les suggestions de questions apparaîtront ici après la détection de changements juridiques pertinents.</p>
              </CardContent>
            </Card>
          ) : (
            allPendingSuggestions.map((suggestion) => {
              let questionData: { text: string; options: string[]; correctAnswer: number; explanation: string; type: string } | null = null;
              try { questionData = JSON.parse(suggestion.suggestedData); } catch { /* skip */ }
              if (!questionData) return null;
              const c = THEME_COLORS[suggestion.themeId] || THEME_COLORS["principes-valeurs"];

              return (
                <Card key={suggestion.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${c.bg} text-white flex items-center justify-center shrink-0 text-sm font-bold`}>
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`${c.light} ${c.text} text-xs`}>{allThemes.find(t => t.id === suggestion.themeId)?.shortTitle || suggestion.themeId}</Badge>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">{suggestion.reason === "add" ? "Ajouter" : "Modifier"}</Badge>
                          <Badge variant="secondary" className="text-xs">{questionData.type === "mise-en-situation" ? "Mise en situation" : "Connaissance"}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-3">{questionData.text}</p>
                        <div className="grid sm:grid-cols-2 gap-2 mb-3">
                          {questionData.options.map((opt, idx) => (
                            <div key={idx} className={`p-2 rounded-lg text-xs flex items-start gap-2 ${idx === questionData.correctAnswer ? "bg-green-50 border border-green-300 font-medium text-green-800" : "bg-gray-50 text-gray-600"}`}>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${idx === questionData.correctAnswer ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {idx === questionData.correctAnswer ? "✓" : String.fromCharCode(65 + idx)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 mb-3">
                          <p className="text-xs text-gray-700 leading-relaxed">{questionData.explanation}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 italic">Source : {suggestion.updateTitle}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs" onClick={() => handleApplySuggestion(suggestion.id, "approve")}>
                            <ThumbsUp className="w-3 h-3 mr-1" /> Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" onClick={() => handleApplySuggestion(suggestion.id, "reject")}>
                            <ThumbsDown className="w-3 h-3 mr-1" /> Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Résumé hebdomadaire */}
      {activeTab === "digest" && (
        <div className="space-y-6">
          {loading === "digest" ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : digest ? (
            <>
              {/* Période */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Semaine du {digest.period ? new Date(digest.period as string).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "..."} au {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>

              {/* Résumé exécutif IA */}
              {((digest as Record<string, unknown>).aiDigest as Record<string, unknown>)?.executiveSummary && (
                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bot className="w-5 h-5 text-violet-600" />
                      Résumé exécutif IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{((digest as Record<string, unknown>).aiDigest as Record<string, unknown>).executiveSummary as string}</p>
                  </CardContent>
                </Card>
              )}

              {/* Stats de la semaine */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-violet-50 border">
                  <div className="text-xs text-gray-500 mb-1">Nouveaux changements</div>
                  <div className="text-2xl font-bold text-gray-900">{(digest.summary as Record<string, number>)?.newUpdatesThisWeek ?? 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border">
                  <div className="text-xs text-gray-500 mb-1">Suggestions en attente</div>
                  <div className="text-2xl font-bold text-gray-900">{(digest.summary as Record<string, number>)?.pendingSuggestions ?? 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border">
                  <div className="text-xs text-gray-500 mb-1">Approuvées cette semaine</div>
                  <div className="text-2xl font-bold text-gray-900">{(digest.summary as Record<string, number>)?.approvedThisWeek ?? 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border">
                  <div className="text-xs text-gray-500 mb-1">Sources officielles</div>
                  <div className="text-2xl font-bold text-gray-900">{(digest.summary as Record<string, number>)?.officialSourcesCount ?? 0}</div>
                </div>
              </div>

              {/* Changements critiques */}
              {((digest as Record<string, unknown>).criticalUpdates as Array<Record<string, unknown>>)?.length > 0 && (
                <Card className="border-2 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                      <Zap className="w-5 h-5" />
                      Changements critiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {((digest as Record<string, unknown>).criticalUpdates as Array<Record<string, unknown>>).map((update, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{update.title as string}</p>
                          <p className="text-sm text-gray-600">{update.description as string}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-red-100 text-red-700 text-xs">{update.impact as string}</Badge>
                            <Badge variant="secondary" className="text-xs">{update.category as string}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions requises par l'IA */}
              {((digest as Record<string, unknown>).aiDigest as Record<string, unknown>)?.actionsRequired && (
                <Card className="border-2 border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="w-5 h-5 text-amber-600" />
                      Actions requises
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(((digest as Record<string, unknown>).aiDigest as Record<string, unknown>).actionsRequired as string[]).map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Tendances */}
              {((digest as Record<string, unknown>).aiDigest as Record<string, unknown>)?.trends && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-violet-600" />
                      Tendances à surveiller
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(((digest as Record<string, unknown>).aiDigest as Record<string, unknown>).trends as string[]).map((trend, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Résumé hebdomadaire</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">Cliquez sur l&apos;onglet pour charger le résumé IA des évolutions de la semaine.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Gouvernement */}
      {activeTab === "government" && (
        <div className="space-y-4">
          {govMembers.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucun membre du gouvernement</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">Cliquez sur &quot;Mettre à jour le gouvernement&quot; pour identifier les membres actuels via la recherche web IA.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Group by role */}
              {["Président de la République", "Premier ministre", "Ministre", "Ministre délégué", "Secrétaire d'État"]
                .filter(role => govMembers.some(m => m.role === role))
                .map(role => (
                  <div key={role}>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{role}s</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {govMembers.filter(m => m.role === role).map((member, i) => (
                        <Card key={i} className="border hover:shadow-sm transition-shadow">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                                role === "Président de la République" ? "bg-violet-700" :
                                role === "Premier ministre" ? "bg-violet-500" :
                                "bg-indigo-400"
                              }`}>
                                {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                                {member.ministry && <p className="text-xs text-gray-500 truncate">{member.ministry}</p>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          {(!status?.recentLogs || status.recentLogs.length === 0) ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucun log disponible</h3>
                <p className="text-gray-400 text-sm">Les logs apparaîtront après la première utilisation de la veille IA.</p>
              </CardContent>
            </Card>
          ) : (
            status.recentLogs.map((log) => (
              <Card key={log.id} className="border hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.status === "completed" ? "bg-green-100 text-green-700" :
                        log.status === "error" ? "bg-red-100 text-red-700" :
                        "bg-violet-100 text-violet-700"
                      }`}>
                        {log.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                         log.status === "error" ? <XCircle className="w-4 h-4" /> :
                         <RefreshCw className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className={`text-xs ${
                        log.status === "completed" ? "bg-green-100 text-green-700" :
                        log.status === "error" ? "bg-red-100 text-red-700" :
                        "bg-violet-100 text-violet-700"
                      }`}>{log.status}</Badge>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-open-sans)" }}>
              <Bot className="w-5 h-5 text-violet-600" />
              Comment fonctionne la Veille IA ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>La Veille IA surveille automatiquement les évolutions juridiques françaises qui pourraient impacter les questions de l&apos;examen civique. Elle utilise la recherche web et l&apos;intelligence artificielle pour identifier, analyser et proposer des mises à jour.</p>
            <p>Le système recherche les nouvelles lois, décrets, circulaires, réformes institutionnelles, remaniements gouvernementaux et jurisprudences pertinentes pour les 5 thématiques de l&apos;examen.</p>
            <p>Chaque changement détecté est analysé par l&apos;IA qui génère des suggestions de questions conformes au format officiel. Vous pouvez approuver ou rejeter chaque suggestion.</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-open-sans)" }}>
              <Shield className="w-5 h-5 text-amber-600" />
              Sources surveillées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Landmark className="w-4 h-4 text-violet-600" /><span className="text-sm text-gray-700"><strong>legifrance.gouv.fr</strong> — Lois, décrets, circulaires officiels</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <FileText className="w-4 h-4 text-violet-600" /><span className="text-sm text-gray-700"><strong>vie-publique.fr</strong> — Résumés officiels des textes</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <FileCheck className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700"><strong>service-public.gouv.fr</strong> — Fiches pratiques</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Building2 className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700"><strong>ofii.fr</strong> — Office Français de l&apos;Immigration et de l&apos;Intégration</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Users className="w-4 h-4 text-purple-600" /><span className="text-sm text-gray-700">Remaniements et composition du gouvernement</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Scale className="w-4 h-4 text-indigo-600" /><span className="text-sm text-gray-700">Jurisprudence Conseil d&apos;État et Cour de cassation</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Globe className="w-4 h-4 text-cyan-600" /><span className="text-sm text-gray-700">Droit de l&apos;immigration, asile, naturalisation</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
              <Clock className="w-4 h-4 text-orange-600" /><span className="text-sm text-gray-700">Veille automatique toutes les <strong>6 heures</strong> (cron)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
