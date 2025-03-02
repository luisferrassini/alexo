import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleVoiceRequest } from "../api/voiceHandler.ts";

const STATIC_DIR = new URL("../static", import.meta.url).pathname;

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/api/process-voice") {
    return await handleVoiceRequest(req);
  }

  // Serve static files
  if (req.method === "GET") {
    try {
      const filePath =
        STATIC_DIR + (url.pathname === "/" ? "/index.html" : url.pathname);
      const content = await Deno.readFile(filePath);
      const contentType = filePath.endsWith(".html")
        ? "text/html"
        : filePath.endsWith(".js")
        ? "text/javascript"
        : "application/octet-stream";

      return new Response(content, {
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

console.log("Starting server on http://localhost:8000");
await serve(handleRequest, { port: 8000 });
