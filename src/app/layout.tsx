import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { LayoutShell } from "@/components/layout-shell";

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
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "CiviquePro - QCM Examen Civique 2026",
    template: "%s · CiviquePro",
  },
  description:
    "Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026. 40 questions, 5 thématiques, 45 minutes chrono. Réussissez votre examen civique du premier coup.",
  keywords: [
    "examen civique",
    "QCM",
    "préparation",
    "titre de séjour",
    "France",
    "république",
    "laïcité",
    "naturalisation",
  ],
  authors: [{ name: "CiviquePro" }],
  creator: "CiviquePro",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "CiviquePro",
    title: "CiviquePro - QCM Examen Civique 2026",
    description:
      "Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026. 40 questions, 5 thématiques, 45 minutes chrono.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CiviquePro - QCM Examen Civique 2026",
    description:
      "Entraînez-vous sur nos QCM examen civique 100% conformes au programme 2026.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
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
          <LayoutShell>
            {children}
          </LayoutShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
