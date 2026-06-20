import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string; // "user" | "admin"
      createdAt?: string; // ISO timestamp — used by /profil "Membre depuis"
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string; // "user" | "admin"
    createdAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    provider?: string;
    role?: string; // "user" | "admin"
    createdAt?: string; // ISO timestamp
  }
}
