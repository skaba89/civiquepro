import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CTABanner } from "@/components/cta-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "QCM Examen Civique 2026 - Tests et Séries en Ligne",
  description: "Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026. 40 questions, 5 thématiques, 45 minutes chrono. Réussissez votre examen civique du premier coup.",
  keywords: ["examen civique", "QCM", "préparation", "titre de séjour", "France", "république", "laïcité"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${openSans.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CTABanner />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
