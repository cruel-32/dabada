// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - better-auth has type inference issues with TypeScript 5.9+
import { betterAuth, type Auth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
const db = drizzle(client, { schema });

export const auth: Auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: { // Add this user configuration
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: false, // OAuth만 사용
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_ID as string, 
      clientSecret: process.env.APPLE_CLIENT_SECRET as string, 

      // clientId: process.env.APPLE_ID!,
      // teamId: process.env.APPLE_TEAM_ID!,
      // keyId: process.env.APPLE_KEY_ID!,
      // privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    },
  },
  baseURL: process.env.AUTH_URL || "http://localhost:3030",
  basePath: "/api/auth",
  trustedOrigins: (origin: string) => {
    // 개발/디버깅용 로그
    console.log("🔍 Checking origin:", origin);

    const allowedOrigins = [
      "http://localhost:3030",
      "http://127.0.0.1:3030",
      "http://172.19.0.2:3030",
      // Capacitor iOS
      "capacitor://localhost",
      // Capacitor Android
      "http://localhost",
      "https://localhost",
      // Deep link scheme
      "io.dabada.app://home",
      "io.dabada.app",
    ];

    // 명시적 허용 목록 확인
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // Capacitor 앱에서 오는 요청 허용 (null origin 또는 capacitor 스킴)
    if (!origin || origin === "null" || origin.startsWith("capacitor://") || origin.startsWith("io.dabada.app")) {
      console.log("✅ Allowing Capacitor origin:", origin);
      return true;
    }

    console.log("❌ Rejected origin:", origin);
    return false;
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production", // 프로덕션에서만 보안 쿠키 사용 (로컬/HTTP 테스트 용이)
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirect callback:", { url, baseUrl });
      // 모바일 앱 스키마 허용
      if (url.startsWith("io.dabada.app://")) {
        console.log("Allowing mobile redirect:", url);
        return url;
      }
      return baseUrl;
    },
  },
});

