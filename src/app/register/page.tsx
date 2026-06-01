"use client";

import React, { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MockOAuthDialog } from "@/components/auth/mock-oauth-dialog";
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  ArrowRight, Trophy, BookOpen, Clock, CheckCircle, Users,
} from "lucide-react";

interface ProviderStatus {
  google: boolean;
  facebook: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({ google: false, facebook: false });
  const [mockDialogProvider, setMockDialogProvider] = useState<"google" | "facebook" | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/");
        router.refresh();
      }
    });
  }, [router]);

  // Check which OAuth providers are configured
  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((res) => res.json())
      .then((data) => setProviderStatus(data))
      .catch(() => {});
  }, []);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Fort"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create account via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte");
        setLoading(false);
        return;
      }

      setSuccess("Compte créé avec succès ! Connexion en cours...");

      // Step 2: Auto-login with the new credentials
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.ok) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    if (providerStatus.google) {
      try {
        await signIn("google", { callbackUrl: "/" });
      } catch (err) {
        console.error("Google login error:", err);
        setError("Erreur lors de la connexion Google");
      }
    } else {
      setMockDialogProvider("google");
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    if (providerStatus.facebook) {
      try {
        await signIn("facebook", { callbackUrl: "/" });
      } catch (err) {
        console.error("Facebook login error:", err);
        setError("Erreur lors de la connexion Facebook");
      }
    } else {
      setMockDialogProvider("facebook");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#7C3AED] flex-col">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-open-sans)" }}>CiviquePro</span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6 w-fit">
            Examen civique 2026
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-6xl font-extrabold text-white" style={{ fontFamily: "var(--font-open-sans)" }}>97%</span>
            <span className="text-xl text-violet-300 font-semibold">de réussite</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-open-sans)" }}>
            Réussissez le prochain examen civique du premier coup
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-lg">
            Préparez-vous avec nos QCM 100% conformes au programme officiel 2026. 40 questions, 5 thématiques, corrections détaillées.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">80+</div>
              <div className="text-xs text-gray-400">Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">45 min</div>
              <div className="text-xs text-gray-400">Chronométré</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">80%</div>
              <div className="text-xs text-gray-400">Pour réussir</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-8">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Programme 2026</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Corrigés détaillés</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-green-400" /> 10k+ utilisateurs</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL - Registration Form ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>CiviquePro</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>
              Créez votre compte gratuitement
            </h2>
            <p className="text-gray-500 mt-2">
              Accédez à tous les QCM et suivez votre progression
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Social login */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-sm font-medium border-2 rounded-lg hover:bg-blue-50 group"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
              {!providerStatus.google && (
                <span className="ml-1 text-xs text-gray-400">(démo)</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-sm font-medium border-2 rounded-lg bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166FE5] hover:border-[#166FE5]"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuer avec Facebook
              {!providerStatus.facebook && (
                <span className="ml-1 text-xs text-blue-200">(démo)</span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-400 font-medium">Ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                autoComplete="name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= strength - 1 ? strengthColors[strength - 1] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Force : {strengthLabels[strength - 1] || "Très faible"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                J&apos;accepte les{" "}
                <button type="button" className="text-violet-600 hover:underline">conditions d&apos;utilisation</button>
                {" "}et la{" "}
                <button type="button" className="text-violet-600 hover:underline">politique de confidentialité</button>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  S&apos;inscrire
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            En créant un compte, vous acceptez que vos données personnelles soient utilisées pour la création et la gestion de votre compte, le suivi de la relation client, la personnalisation de votre expérience et la sécurité de notre service. Vos données ne seront pas revendues à des tiers.
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="text-violet-600 font-semibold hover:text-violet-700 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Mock OAuth Dialog */}
      <MockOAuthDialog
        provider="google"
        isOpen={mockDialogProvider === "google"}
        onClose={() => setMockDialogProvider(null)}
      />
      <MockOAuthDialog
        provider="facebook"
        isOpen={mockDialogProvider === "facebook"}
        onClose={() => setMockDialogProvider(null)}
      />
    </div>
  );
}
