import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleVoiceRequest } from "./src/api/voiceHandler.ts";
import "jsr:@std/dotenv/load";

// Server configuration
const PORT = 8000;
const CALLBACK_PATH = "/oauth2callback";
const STATIC_DIR = `${Deno.cwd()}/static`;

export const REDIRECT_URI = `http://localhost:${PORT}${CALLBACK_PATH}`;

// OAuth server state
interface AuthCallback {
  code: string;
  error?: string;
}

let authCallback: AuthCallback | null = null;
let resolveAuth: ((value: AuthCallback) => void) | null = null;

// Combined request handler for both main app and OAuth
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log("Incoming request:", {
    pathname,
    method: req.method,
    staticDir: STATIC_DIR,
  });

  // Handle OAuth callback
  if (pathname === CALLBACK_PATH) {
    console.log("OAuth callback received:", {
      code: url.searchParams.get("code"),
      error: url.searchParams.get("error"),
    });

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (code || error) {
      authCallback = { code: code || "", error: error || undefined };

      if (resolveAuth) {
        resolveAuth(authCallback);
        resolveAuth = null;
      }

      const htmlResponse = `
<!DOCTYPE html>
<html>
  <head>
    <title>Authorization Complete</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background-color: #f5f5f5;
      }
      .container {
        text-align: center;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      h1 { color: #2c3e50; }
      p { color: #34495e; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Authorization Complete</h1>
      <p>You can close this window and return to the application.</p>
    </div>
    <script>
      setTimeout(() => window.close(), 2000);
    </script>
  </body>
</html>`;

      return new Response(htmlResponse, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      });
    }
  }

  // Handle voice processing endpoint
  if (req.method === "POST" && pathname === "/api/process-voice") {
    return await handleVoiceRequest(req);
  }

  // Serve static files
  if (req.method === "GET") {
    try {
      const filePath =
        pathname === "/"
          ? `${STATIC_DIR}/index.html`
          : `${STATIC_DIR}${pathname}`;

      console.log("Attempting to serve static file:", {
        requestPath: pathname,
        fullFilePath: filePath,
        cwd: Deno.cwd(),
      });

      const content = await Deno.readFile(filePath);
      const contentType = filePath.endsWith(".html")
        ? "text/html"
        : filePath.endsWith(".js")
        ? "text/javascript"
        : filePath.endsWith(".css")
        ? "text/css"
        : "application/octet-stream";

      console.log("Successfully serving file:", filePath);
      return new Response(content, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      console.error("Failed to serve file:", {
        error,
        requestPath: pathname,
        fullFilePath:
          pathname === "/"
            ? `${STATIC_DIR}/index.html`
            : `${STATIC_DIR}${pathname}`,
        cwd: Deno.cwd(),
      });
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function waitForCallback(): Promise<AuthCallback> {
  if (authCallback) {
    const callback = authCallback;
    authCallback = null;
    return callback;
  }

  return new Promise((resolve) => {
    resolveAuth = resolve;
  });
}

// Debug logging
console.debug("Environment variables:", {
  GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") ? "present" : "missing",
  CALENDAR_ID: Deno.env.get("CALENDAR_ID") ? "present" : "missing",
});

console.debug("Using calendar ID:", Deno.env.get("CALENDAR_ID"));

// Start the server
console.log(`Starting server on http://localhost:${PORT}`);
await serve(handleRequest, { port: PORT });
