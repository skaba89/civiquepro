import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const isProduction = process.env.NODE_ENV === "production";

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

// Build providers list
const providers: NextAuthOptions["providers"] = [];

// Google provider - only register if properly configured, or in dev with placeholder
if (isGoogleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    })
  );
} else if (!isProduction) {
  // In development, register with placeholder so the provider appears in the UI
  // The actual OAuth flow will fail gracefully
  providers.push(
    GoogleProvider({
      clientId: "mock-google-client-id.apps.googleusercontent.com",
      clientSecret: "mock-google-client-secret",
    })
  );
}

// Facebook provider - only register if properly configured, or in dev with placeholder
if (isFacebookConfigured) {
  providers.push(
    FacebookProvider({
      clientId: facebookClientId!,
      clientSecret: facebookClientSecret!,
    })
  );
} else if (!isProduction) {
  providers.push(
    FacebookProvider({
      clientId: "mock-facebook-app-id",
      clientSecret: "mock-facebook-app-secret",
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

      return {
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image || null,
        role: user.role,
      };
    },
  })
);

// Mock OAuth providers - DEVELOPMENT ONLY
// These allow testing OAuth flows without real credentials
// They are DISABLED in production to prevent unauthorized account creation
if (!isProduction) {
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
}

export const authOptions: NextAuthOptions = {
  // Use PrismaAdapter for database-backed sessions and account linking
  // Falls back to JWT strategy for credentials provider (required by NextAuth)
  adapter: PrismaAdapter(db),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: !isProduction,
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = (user as { role?: string }).role || "user";
      }
      if (account) {
        token.provider = account.provider;
      }
      // Always refresh role from DB on token update
      if (trigger === "update" && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.role = dbUser.role;
        }
      }
      // Ensure role is always populated (first login via OAuth may not have it)
      if (!token.role && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
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
        (session.user as { role?: string }).role = token.role as string || "user";
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
