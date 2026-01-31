import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = handler.GET as (req: Request) => Promise<Response>;
export const POST = handler.POST as (req: Request) => Promise<Response>;