import { PrismaClient } from '@prisma/client'

// Validate critical environment variables at runtime only (not during build)
// During `next build`, env vars may not be available yet — they are injected at runtime
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL);

const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && !isBuildTime) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please set these in your deployment platform dashboard.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  } else {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}. Using defaults for development.`);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
