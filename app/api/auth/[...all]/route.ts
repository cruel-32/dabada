import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = (req: Request) => {
  console.log("WEB AUTH HANDLER CALLED FOR URL:", req.url);
  return (handler.GET as (req: Request) => Promise<Response>)(req);
}
export const POST = (req: Request) => {
  console.log("WEB AUTH HANDLER CALLED FOR URL:", req.url);
  return (handler.POST as (req: Request) => Promise<Response>)(req);
}