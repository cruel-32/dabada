import { authNative } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(authNative);

const logNativeAuthRequest = (req: Request) => {
  const headers = req.headers;
  console.log('[NativeAuth] request', {
    url: req.url,
    method: req.method,
    origin: headers.get('origin'),
    referer: headers.get('referer'),
    userAgent: headers.get('user-agent'),
  });
};

const getHandler = handler.GET as (req: Request) => Promise<Response>;
const postHandler = handler.POST as (req: Request) => Promise<Response>;

export const GET = async (req: Request): Promise<Response> => {
  console.log("NATIVE AUTH HANDLER CALLED FOR URL:", req.url);
  logNativeAuthRequest(req);
  return getHandler(req);
};

export const POST = async (req: Request): Promise<Response> => {
  console.log("NATIVE AUTH HANDLER CALLED FOR URL:", req.url);
  logNativeAuthRequest(req);
  return postHandler(req);
};
