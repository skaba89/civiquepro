"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, User, Loader2, AlertCircle, Info,
} from "lucide-react";

interface MockOAuthDialogProps {
  provider: "google" | "facebook";
  isOpen: boolean;
  onClose: () => void;
}

export function MockOAuthDialog({ provider, isOpen, onClose }: MockOAuthDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const providerLabel = provider === "google" ? "Google" : "Facebook";
  const providerColor = provider === "google" ? "text-blue-600" : "text-[#1877F2]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Veuillez saisir votre email");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(`mock-${provider}`, {
        email: email.toLowerCase().trim(),
        name: name || undefined,
        redirect: false,
      });

      if (result?.error) {
        setError("Erreur lors de la connexion. Veuillez réessayer.");
        setLoading(false);
      } else if (result?.ok) {
        // Success - close dialog and refresh
        onClose();
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        setError("Erreur inattendue. Veuillez réessayer.");
        setLoading(false);
      }
    } catch (err) {
      console.error(`Mock ${provider} login error:`, err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${
          provider === "google"
            ? "bg-gradient-to-r from-blue-50 to-white"
            : "bg-gradient-to-r from-blue-600 to-blue-700"
        }`}>
          <div className="flex items-center gap-3">
            {provider === "google" ? (
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <div>
              <h3 className={`font-bold text-lg ${provider === "facebook" ? "text-white" : "text-gray-900"}`}>
                Connexion avec {providerLabel}
              </h3>
              <p className={`text-sm ${provider === "facebook" ? "text-blue-100" : "text-gray-500"}`}>
                Mode démonstration
              </p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            OAuth {providerLabel} n&apos;est pas encore configuré avec des identifiants réels.
            Saisissez vos informations pour simuler la connexion.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mock-name" className="text-sm font-medium text-gray-700">
              Nom (optionnel)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="mock-name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mock-email" className="text-sm font-medium text-gray-700">
              E-mail <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="mock-email"
                type="email"
                placeholder={`votre@email-${provider}.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-lg font-medium"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className={`flex-1 h-11 font-semibold rounded-lg text-white ${
                provider === "google"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-[#1877F2] hover:bg-[#166FE5]"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter avec {providerLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
