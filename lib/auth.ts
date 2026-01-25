import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
const db = drizzle(client, { schema });

export const auth = betterAuth({
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
  trustedOrigins: [
    "http://localhost:3030",
    "http://127.0.0.1:3030",
    "http://172.19.0.2:3030",
    "capacitor://localhost",
    "http://localhost",
    "io.dabada.app://home",
  ],
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

