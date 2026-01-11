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
    "http://172.19.0.2:3030⁠"
    // 개발 환경에서 필요한 다른 origin들
  ],
});

