declare module "better-auth" {
  export function betterAuth(config: unknown): unknown;
}

declare module "better-auth/adapters/drizzle" {
  export function drizzleAdapter(
    ...args: unknown[]
  ): unknown;
}

declare module "better-auth/next-js" {
  export function toNextJsHandler(
    auth: unknown
  ): { GET: (...args: unknown[]) => unknown; POST: (...args: unknown[]) => unknown };
}
