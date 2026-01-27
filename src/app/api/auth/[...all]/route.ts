import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = async (request: Request) => {
    console.log(`[Auth API] GET ${request.url}`);
    console.log(`[Auth API] Origin: ${request.headers.get('origin')}`);
    console.log(`[Auth API] Host: ${request.headers.get('host')}`);
    return handler.GET(request);
};

export const POST = async (request: Request) => {
    console.log(`[Auth API] POST ${request.url}`);
    console.log(`[Auth API] Origin: ${request.headers.get('origin')}`);
    return handler.POST(request);
};
