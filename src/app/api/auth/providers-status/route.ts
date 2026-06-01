import { NextResponse } from "next/server";
import { isGoogleConfigured, isFacebookConfigured } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    google: isGoogleConfigured,
    facebook: isFacebookConfigured,
  });
}
