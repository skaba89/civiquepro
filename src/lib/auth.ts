import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Check if OAuth providers are properly configured
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured = !!(
  googleClientId &&
  googleClientSecret &&
  googleClientId !== "" &&
  googleClientSecret !== "" &&
  googleClientId !== "dummy-google-client-id" &&
  googleClientSecret !== "dummy-google-client-secret"
);

const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const isFacebookConfigured = !!(
  facebookClientId &&
  facebookClientSecret &&
  facebookClientId !== "" &&
  facebookClientSecret !== ""
);

// Build providers list - always include all providers
// For unconfigured OAuth, we use placeholder credentials that allow the provider
// to be registered but the actual OAuth flow will fail (expected in dev).
// The frontend will use mock OAuth flow for unconfigured providers.
const providers: NextAuthOptions["providers"] = [];

// Google provider - always registered
providers.push(
  GoogleProvider({
    clientId: isGoogleConfigured ? googleClientId! : "mock-google-client-id.apps.googleusercontent.com",
    clientSecret: isGoogleConfigured ? googleClientSecret! : "mock-google-client-secret",
    allowDangerousEmailAccountLinking: true,
  })
);

// Facebook provider - always registered
providers.push(
  FacebookProvider({
    clientId: isFacebookConfigured ? facebookClientId! : "mock-facebook-app-id",
    clientSecret: isFacebookConfigured ? facebookClientSecret! : "mock-facebook-app-secret",
    allowDangerousEmailAccountLinking: true,
  })
);

// Credentials provider - always available
providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = credentials.email.toLowerCase().trim();

      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image || null,
      };
    },
  })
);

// Mock OAuth provider - for development without real OAuth credentials
// This provider creates/finds users based on the mock provider name
providers.push(
  CredentialsProvider({
    id: "mock-google",
    name: "mock-google",
    credentials: {
      email: { label: "Email", type: "email" },
      name: { label: "Name", type: "text" },
      image: { label: "Image", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;

      const email = credentials.email.toLowerCase().trim();
      const name = credentials.name || email.split("@")[0];

      // Find or create user
      let user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name,
            image: credentials.image || null,
            emailVerified: new Date(),
          },
        });
      }

      return {
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image || null,
      };
    },
  })
);

providers.push(
  CredentialsProvider({
    id: "mock-facebook",
    name: "mock-facebook",
    credentials: {
      email: { label: "Email", type: "email" },
      name: { label: "Name", type: "text" },
      image: { label: "Image", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;

      const email = credentials.email.toLowerCase().trim();
      const name = credentials.name || email.split("@")[0];

      let user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name,
            image: credentials.image || null,
            emailVerified: new Date(),
          },
        });
      }

      return {
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image || null,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "civiquepro-dev-secret-key-2026",
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (account) {
        token.provider = account.provider;
      }
      if (trigger === "update" && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string || null;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For real Google OAuth
      if (account?.provider === "google" && profile?.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
          });
          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: (profile as Record<string, unknown>).picture as string || null,
                emailVerified: new Date(),
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error handling Google sign in:", error);
          return false;
        }
      }
      // For real Facebook OAuth
      if (account?.provider === "facebook" && profile?.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
          });
          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: (profile as Record<string, unknown>).picture as string || null,
                emailVerified: new Date(),
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error handling Facebook sign in:", error);
          return false;
        }
      }
      return true;
    },
  },
};

export { isGoogleConfigured, isFacebookConfigured };
