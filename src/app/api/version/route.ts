import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export async function GET() {
  try {
    return NextResponse.json({
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}
