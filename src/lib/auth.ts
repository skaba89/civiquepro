import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Check if OAuth providers are properly configured
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured = !!(googleClientId && googleClientSecret &&
  googleClientId !== "dummy-google-client-id" &&
  googleClientSecret !== "dummy-google-client-secret");

const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const isFacebookConfigured = !!(facebookClientId && facebookClientSecret);

// Build providers list - only include OAuth providers if properly configured
const providers: NextAuthOptions["providers"] = [];

if (isGoogleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isFacebookConfigured) {
  providers.push(
    FacebookProvider({
      clientId: facebookClientId!,
      clientSecret: facebookClientSecret!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email et mot de passe requis");
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      if (!user || !user.password) {
        throw new Error("Aucun compte trouvé avec cet email");
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (!isValid) {
        throw new Error("Mot de passe incorrect");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter type mismatch with next-auth v4
  adapter: PrismaAdapter(db),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user exists in database
      if (account?.provider === "google" && profile?.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
          });
          if (!existingUser) {
            await db.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: (profile as Record<string, unknown>).picture as string || null,
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error handling Google sign in:", error);
        }
      }
      if (account?.provider === "facebook" && profile?.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
          });
          if (!existingUser) {
            await db.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: (profile as Record<string, unknown>).picture as string || null,
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error handling Facebook sign in:", error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "civiquepro-dev-secret-key-2026",
  debug: process.env.NODE_ENV === "development",
};

export { isGoogleConfigured, isFacebookConfigured };
