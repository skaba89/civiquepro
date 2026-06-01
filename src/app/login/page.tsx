"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  ArrowRight, Trophy, BookOpen, Clock, CheckCircle, Users,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Email ou mot de passe incorrect"
            : result.error
        );
      } else {
        setSuccess("Connexion réussie ! Redirection...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Erreur lors de la connexion Google");
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("facebook", { callbackUrl: "/" });
    } catch {
      setError("Erreur lors de la connexion Facebook");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT PANEL - Marketing Content ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#7C3AED] flex-col">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-open-sans)" }}>CiviquePro</span>
          </Link>
        </div>

        {/* Main content */}
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

      {/* ===== RIGHT PANEL - Login Form ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>CiviquePro</span>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-open-sans)" }}>
              Bienvenue sur CiviquePro
            </h2>
            <p className="text-gray-500 mt-2">
              Connectez-vous pour accéder à vos QCM et votre progression
            </p>
          </div>

          {/* Error / Success messages */}
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

          {/* Social login buttons */}
          <div className="space-y-3 mb-6">
            <Button
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
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium border-2 rounded-lg bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166FE5] hover:border-[#166FE5]"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuer avec Facebook
            </Button>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 mb-6">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-400 font-medium">Ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                  autoComplete="current-password"
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
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Se souvenir de moi
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
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-violet-600 font-semibold hover:text-violet-700 hover:underline"
              >
                Créer un compte gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
