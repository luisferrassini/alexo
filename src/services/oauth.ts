import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { waitForCallback, REDIRECT_URI } from "../../main.ts";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = join("credentials", "token.json");
const CREDENTIALS_PATH = join("credentials", "oauth_credentials.json");

interface Token {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type: string;
  scope?: string;
  expires_in?: number;
}

interface OAuthCredentials {
  client_id: string;
  client_secret: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

async function loadCredentials(): Promise<OAuthCredentials> {
  try {
    const credentialsText = await Deno.readTextFile(CREDENTIALS_PATH);
    const credentialsData = JSON.parse(credentialsText);

    // Extract credentials from the "installed" property
    const credentials = credentialsData.installed;

    // Validate required fields
    const missingFields = [];
    if (!credentials.client_id) missingFields.push("client_id");
    if (!credentials.client_secret) missingFields.push("client_secret");

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required credentials fields: ${missingFields.join(", ")}`
      );
    }

    return {
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
    };
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        `Credentials file not found at ${CREDENTIALS_PATH}. Please create this file with your OAuth credentials.`
      );
    }
    throw error;
  }
}

async function saveToken(token: Token): Promise<void> {
  try {
    await Deno.writeTextFile(TOKEN_PATH, JSON.stringify(token, null, 2));
  } catch (error) {
    console.error(
      "Failed to save token:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function loadToken(): Promise<Token | null> {
  try {
    const tokenText = await Deno.readTextFile(TOKEN_PATH);
    return JSON.parse(tokenText) as Token;
  } catch {
    return null;
  }
}

export async function authorize(): Promise<AuthResponse> {
  try {
    const credentials = await loadCredentials();
    const existingToken = await loadToken();

    // Check if we have a valid token
    if (existingToken?.expiry_date && existingToken.expiry_date > Date.now()) {
      return {
        access_token: existingToken.access_token,
        token_type: existingToken.token_type,
        scope: existingToken.scope || SCOPES.join(" "),
      };
    }

    // If we have a refresh token, try to use it
    if (existingToken?.refresh_token) {
      try {
        const newToken = await refreshToken(
          credentials.client_id,
          credentials.client_secret,
          existingToken.refresh_token
        );
        return {
          access_token: newToken.access_token,
          token_type: newToken.token_type,
          scope: newToken.scope || SCOPES.join(" "),
        };
      } catch (_error) {
        console.log("Failed to refresh token, getting new token instead");
        // If refresh fails, fall through to getting a new token
      }
    }

    // Get a new token if refresh token is missing or refresh failed
    const newToken = await getNewToken(
      credentials.client_id,
      credentials.client_secret
    );
    return {
      access_token: newToken.access_token,
      token_type: newToken.token_type,
      scope: newToken.scope || SCOPES.join(" "),
    };
  } catch (error) {
    throw new Error(
      `Authorization failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function getNewToken(
  clientId: string,
  clientSecret: string
): Promise<Token> {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("scope", SCOPES.join(" "));

  // Open the auth URL in the default browser
  const openCommand =
    Deno.build.os === "windows"
      ? "start"
      : Deno.build.os === "darwin"
      ? "open"
      : "xdg-open";

  try {
    await new Deno.Command(openCommand, {
      args: [authUrl.toString()],
    }).output();
  } catch (_error) {
    console.log(
      "Please visit this URL to authorize the application:",
      authUrl.toString()
    );
  }

  // Wait for the callback
  const callback = await waitForCallback();

  if (callback.error) {
    throw new Error(`Authorization failed: ${callback.error}`);
  }

  if (!callback.code) {
    throw new Error("No authorization code received");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: callback.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${await response.text()}`);
  }

  const token = (await response.json()) as Token;
  token.expiry_date = Date.now() + (token.expires_in || 3600) * 1000;
  await saveToken(token);

  return token;
}

async function refreshToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<Token> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${await response.text()}`);
  }

  const token = (await response.json()) as Token;
  token.refresh_token = refreshToken;
  token.expiry_date = Date.now() + (token.expires_in || 3600) * 1000;
  await saveToken(token);
  return token;
}
