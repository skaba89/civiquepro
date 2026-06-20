import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Lightweight health-check endpoint used by Render/Netlify/Docker
 * to verify the service is up. Does NOT touch the database by design
 * (so it stays fast and won't flap if DB has a transient blip).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "civiquepro",
    },
    { status: 200 }
  );
}
