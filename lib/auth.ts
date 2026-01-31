// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - better-auth has type inference issues with TypeScript 5.9+
import { betterAuth, type Auth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { decodeProtectedHeader, importJWK, jwtVerify } from "jose";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
const db = drizzle(client, { schema });
const publicBaseUrl =
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3030";

const googleWebClientId =
  process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";

const googleAllowedAudiences = Array.from(
  new Set(
    [
      googleWebClientId,
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
    ].filter(Boolean) as string[]
  )
);

const getGooglePublicKey = async (
  kid: string
): Promise<CryptoKey | Uint8Array> => {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  const data = (await response.json()) as {
    keys?: { kid: string; alg: string }[];
  };
  if (!data?.keys) {
    throw new Error("Google JWKs not found");
  }
  const jwk = data.keys.find((key) => key.kid === kid);
  if (!jwk) {
    throw new Error(`Google JWK with kid ${kid} not found`);
  }
  return (await importJWK(jwk, jwk.alg)) as CryptoKey | Uint8Array;
};

const authOptions = {
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
      clientId: googleWebClientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      verifyIdToken: async (token: string, nonce?: string) => {
        try {
          const { kid, alg: jwtAlg } = decodeProtectedHeader(token);
          if (!kid || !jwtAlg) return false;
          const audience = googleAllowedAudiences.length
            ? googleAllowedAudiences
            : googleWebClientId || undefined;
          const key = (await getGooglePublicKey(kid)) as unknown as Parameters<
            typeof jwtVerify
          >[1];
          const { payload: jwtClaims } = await jwtVerify(token, key, {
              algorithms: [jwtAlg],
              issuer: ["https://accounts.google.com", "accounts.google.com"],
              audience,
              maxTokenAge: "1h",
          });
          if (nonce && jwtClaims.nonce !== nonce) return false;
          return true;
        } catch (error) {
          console.error("[GoogleIdToken] verification failed", {
            message: error instanceof Error ? error.message : String(error),
          });
          return false;
        }
      },
    },
    apple: {
      clientId: process.env.APPLE_ID as string, 
      clientSecret: process.env.APPLE_CLIENT_SECRET as string, 
      audience: [
        process.env.APPLE_ID,
        process.env.APPLE_APP_BUNDLE_ID,
        process.env.APPLE_BUNDLE_ID,
      ].filter(Boolean) as string[],

      // clientId: process.env.APPLE_ID!,
      // teamId: process.env.APPLE_TEAM_ID!,
      // keyId: process.env.APPLE_KEY_ID!,
      // privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    },
  },
  baseURL: publicBaseUrl,
  basePath: "/api/auth",
  trustedOrigins: [
    // Local development
    "http://localhost:3000",
    "http://localhost:3030",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3030",
    // Capacitor webview origins
    "capacitor://localhost",
    "ionic://localhost",
    // Docker network
    "http://172.19.0.2:3030",
    "http://172.19.0.3:3030",
    // LAN IPs (for mobile testing)
    "http://172.30.1.43:3030",
    // Production
    "https://dabada.cloudish.cloud",
    "http://localhost",
    "https://localhost",
    publicBaseUrl,
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production", // 프로덕션에서만 보안 쿠키 사용 (로컬/HTTP 테스트 용이)
  },
  onAPIError: {
    onError(error: unknown, ctx: { request?: Request } | undefined) {
      const requestInfo = {
        path: ctx?.request?.url,
        method: ctx?.request?.method,
      };
      console.error("[AuthAPIError]", requestInfo, error);
    },
  },
  callbacks: {
    async redirect({ baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl;
    },
  },
};

export const auth: Auth = betterAuth(authOptions);

export const authNative: Auth = betterAuth({
  ...authOptions,
  basePath: "/api/native-auth",
  advanced: {
    ...authOptions.advanced,
    disableCSRFCheck: true,
    disableOriginCheck: true,
  },
});

