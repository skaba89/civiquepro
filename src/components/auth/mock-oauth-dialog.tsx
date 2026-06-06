"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, User, Loader2, AlertCircle, Shield,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Veuillez saisir votre adresse e-mail");
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
        onClose();
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        setError("Erreur inattendue. Veuillez réessayer.");
        setLoading(false);
      }
    } catch (err) {
      console.error(`OAuth ${provider} login error:`, err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Provider header */}
        {provider === "google" ? (
          <div className="bg-white px-8 pt-8 pb-4">
            {/* Google sign-in style header */}
            <div className="flex flex-col items-center text-center">
              <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="text-xl font-normal text-gray-800 mb-1">
                Se connecter avec Google
              </h3>
              <p className="text-sm text-gray-500">
                Utilisez votre compte Google pour vous connecter à CiviquePro
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1877F2] px-8 pt-8 pb-4">
            <div className="flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-white mb-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-1">
                Se connecter avec Facebook
              </h3>
              <p className="text-sm text-blue-100">
                Utilisez votre compte Facebook pour vous connecter à CiviquePro
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="oauth-name" className="text-sm font-medium text-gray-700">
              Nom complet
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="oauth-name"
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
            <Label htmlFor="oauth-email" className="text-sm font-medium text-gray-700">
              Adresse e-mail <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="oauth-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500/20"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              En continuant, vous acceptez que CiviquePro utilise votre e-mail pour créer votre compte et gérer votre progression. Vos données ne seront pas partagées.
            </span>
          </div>

          <div className="flex gap-3 pt-1">
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
              className={`flex-1 h-11 font-semibold rounded-lg text-white shadow-md ${
                provider === "google"
                  ? "bg-violet-600 hover:bg-violet-700 shadow-violet-200"
                  : "bg-[#1877F2] hover:bg-[#166FE5] shadow-violet-200"
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
                  Continuer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
