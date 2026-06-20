"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User, Trophy, Clock, Target, TrendingUp,
  BookOpen, Settings, ArrowRight, Calendar,
  CheckCircle2, XCircle, BarChart3,
} from "lucide-react";

interface QuizResult {
  id: string;
  quizType: string;
  themeId: string | null;
  serieId: string | null;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeUsed: number;
  completedAt: string;
}

export function ProfileContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  // Account settings state
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/profil");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sync editName with user name
  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user?.name]);

  // Fetch quiz results
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/quiz-results")
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setResults(data.results || []);
          setLoadingResults(false);
        })
        .catch(() => setLoadingResults(false));
    }
  }, [isAuthenticated]);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingName(true);
    setNameMessage(null);
    try {
      const res = await fetch("/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setNameMessage({ type: "success", text: "Nom mis à jour avec succès !" });
      } else {
        const data = await res.json();
        setNameMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour." });
      }
    } catch {
      setNameMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Veuillez remplir tous les champs." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Mot de passe mis à jour avec succès !" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour." });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded w-64" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Vous devez être connecté pour accéder à votre profil et suivre votre progression.
        </p>
        <Link href="/login?callbackUrl=/profil">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold">
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalQuizzes = results.length;
  const avgScore = totalQuizzes > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalQuizzes) : 0;
  const bestScore = totalQuizzes > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const totalTime = results.reduce((acc, r) => acc + r.timeUsed, 0);
  const passedCount = results.filter(r => r.passed).length;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quizTypeLabels: Record<string, string> = {
    qcm: "QCM",
    "examen-blanc": "Examen Blanc",
    theme: "QCM Thématique",
  };

  // createdAt is now carried in the session token (see src/lib/auth.ts)
  const memberSince = (user as { createdAt?: string }).createdAt || null;
  const memberSinceFormatted = memberSince
    ? new Date(memberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.name || ""} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <span className="text-white font-bold text-2xl">
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div>
          <p
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-open-sans)" }}
          >
            {user.name || "Utilisateur"}
          </p>
          <p className="text-gray-500 mt-1">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Membre CiviquePro</Badge>
            {memberSinceFormatted && (
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-3.5 h-3.5" /> Membre depuis {memberSinceFormatted}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              <span className="text-xs text-gray-500">Quiz complétés</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-500">Score moyen</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{avgScore}%</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-gray-500">Meilleur score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{bestScore}%</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-gray-500">Temps total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(totalTime)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-2">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ fontFamily: "var(--font-open-sans)" }}
          >
            <BarChart3 className="w-5 h-5 text-violet-600" /> Progression globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
                <span className="text-sm font-bold text-gray-900">
                  {totalQuizzes > 0 ? Math.round((passedCount / totalQuizzes) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalQuizzes > 0 ? (passedCount / totalQuizzes) * 100 : 0}
                className="h-3 [&>[data-slot=progress-indicator]]:bg-violet-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Score moyen</span>
                <span className="text-sm font-bold text-gray-900">{avgScore}%</span>
              </div>
              <Progress
                value={avgScore}
                className={`h-3 ${avgScore >= 80 ? "[&>[data-slot=progress-indicator]]:bg-green-500" : "[&>[data-slot=progress-indicator]]:bg-orange-500"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: "var(--font-open-sans)" }}
        >
          Résultats récents
        </h2>
        {loadingResults ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                Aucun résultat pour le moment
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Commencez à vous entraîner avec nos QCM pour voir vos résultats ici.
              </p>
              <Link href="/qcm">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold">
                  Démarrer un QCM <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.slice(0, 10).map((result) => (
              <Card key={result.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          result.passed ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {result.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {quizTypeLabels[result.quizType] || result.quizType}
                        </p>
                        <p className="text-sm text-gray-500">
                          {result.correctAnswers}/{result.totalQuestions} correctes ·{" "}
                          {formatTime(result.timeUsed)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          result.passed ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.round(result.score)}%
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(result.completedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-10" />

      {/* Account Settings */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
          style={{ fontFamily: "var(--font-open-sans)" }}
        >
          <Settings className="w-6 h-6 text-violet-600" /> Paramètres du compte
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Name change */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle
                className="text-lg flex items-center gap-2"
                style={{ fontFamily: "var(--font-open-sans)" }}
              >
                <User className="w-5 h-5 text-violet-600" /> Modifier le nom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Nom affiché
                </label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Votre nom"
                  className="border-gray-200 focus:border-violet-600 focus:ring-violet-600"
                />
              </div>
              {nameMessage && (
                <p
                  className={`text-sm font-medium ${
                    nameMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {nameMessage.text}
                </p>
              )}
              <Button
                onClick={handleSaveName}
                disabled={savingName || !editName.trim() || editName === user.name}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
              >
                {savingName ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardContent>
          </Card>

          {/* Password change */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle
                className="text-lg flex items-center gap-2"
                style={{ fontFamily: "var(--font-open-sans)" }}
              >
                <Settings className="w-5 h-5 text-orange-500" /> Modifier le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Mot de passe actuel
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200 focus:border-violet-600 focus:ring-violet-600"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Nouveau mot de passe
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200 focus:border-violet-600 focus:ring-violet-600"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200 focus:border-violet-600 focus:ring-violet-600"
                />
              </div>
              {passwordMessage && (
                <p
                  className={`text-sm font-medium ${
                    passwordMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}
              <Button
                onClick={handleSavePassword}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                {savingPassword ? "Enregistrement..." : "Mettre à jour le mot de passe"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
