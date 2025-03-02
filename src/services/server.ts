import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CALLBACK_PATH = "/oauth2callback";
const PORT = 8080;

interface AuthCallback {
  code: string;
  error?: string;
}

let authCallback: AuthCallback | null = null;
let resolveAuth: ((value: AuthCallback) => void) | null = null;

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === CALLBACK_PATH) {
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

  return new Response("Not found", { status: 404 });
}

let serverController: AbortController | null = null;

export async function startServer(): Promise<void> {
  if (serverController) return;

  serverController = new AbortController();
  console.log(`Starting server at http://localhost:${PORT}`);

  serve(handleRequest, {
    port: PORT,
    signal: serverController.signal,
    onListen: ({ port }) => {
      console.log(`Server running at http://localhost:${port}`);
    },
  });
}

export async function stopServer(): Promise<void> {
  if (!serverController) return;

  serverController.abort();
  serverController = null;
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

export const REDIRECT_URI = `http://localhost:${PORT}${CALLBACK_PATH}`;
