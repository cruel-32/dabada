import { authNative } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(authNative);

const logNativeAuthRequest = (req: Request) => {
  const headers = req.headers;
  console.log("[NativeAuth] request", {
    url: req.url,
    method: req.method,
    origin: headers.get("origin"),
    referer: headers.get("referer"),
    userAgent: headers.get("user-agent"),
  });
};

export const GET = (req: Request) => {
  logNativeAuthRequest(req);
  return handler.GET(req);
};

export const POST = (req: Request) => {
  logNativeAuthRequest(req);
  return handler.POST(req);
};
