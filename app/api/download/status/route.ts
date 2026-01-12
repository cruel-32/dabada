import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLastDownloadTime, getUserRole } from "@/lib/db";
import { DOWNLOAD_COOLDOWN_SECONDS } from "@/lib/config";

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export async function GET(request: NextRequest) {
  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    const session = await auth.api.getSession({
      headers: headers as any,
    });

    if (!session?.user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = await getUserRole(userId);
    let cooldownUntil: string | null = null;

    if (role !== "admin") {
      const lastDownload = await getLastDownloadTime(userId);
      const now = new Date();

      if (lastDownload) {
        const cooldownEnd = addSeconds(lastDownload.downloadedAt, DOWNLOAD_COOLDOWN_SECONDS);
        if (now < cooldownEnd) {
          cooldownUntil = cooldownEnd.toISOString();
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      cooldownUntil,
    });
  } catch (error) {
    console.error("Cooldown check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
