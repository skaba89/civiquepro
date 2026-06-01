import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
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

// Build providers list
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

      // Return user object that will be saved in JWT
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
  // IMPORTANT: Do NOT use PrismaAdapter with Credentials provider + JWT strategy
  // The adapter causes conflicts with credentials-based auth.
  // We handle user lookup manually in the authorize() function instead.
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
      // On sign in, add user info to the token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (account) {
        token.provider = account.provider;
      }
      // On session update, refresh user data from DB
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
      // For OAuth providers, ensure user exists in database
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
