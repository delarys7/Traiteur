import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = async (request: Request) => {
    try {
        console.log(`[Auth API] GET ${request.url}`);
        const response = await handler.GET(request);
        console.log(`[Auth API] GET Response status: ${response.status}`);
        return response;
    } catch (err) {
        console.error(`[Auth API] FATAL ERROR in GET ${request.url}:`, err);
        throw err;
    }
};

export const POST = async (request: Request) => {
    try {
        console.log(`[Auth API] POST ${request.url}`);
        const response = await handler.POST(request);
        console.log(`[Auth API] POST Response status: ${response.status}`);
        return response;
    } catch (err) {
        console.error(`[Auth API] FATAL ERROR in POST ${request.url}:`, err);
        throw err;
    }
};
