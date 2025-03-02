import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";

const CREDENTIALS_DIR = "./credentials";
const GITIGNORE_PATH = "./.gitignore";
const CREDENTIALS_FILE = "oauth_credentials.json";

interface OAuthCredentials {
  installed: {
    client_id: string;
    client_secret: string;
    auth_uri: string;
    token_uri: string;
  };
}

async function setupGitignore(): Promise<void> {
  const gitignoreEntries = [
    "credentials/oauth_credentials.json",
    "credentials/token.json",
    ".env",
  ];

  let gitignoreContent = "";
  if (await exists(GITIGNORE_PATH)) {
    gitignoreContent = await Deno.readTextFile(GITIGNORE_PATH);
  }

  const newEntries = gitignoreEntries.filter(
    (entry) => !gitignoreContent.includes(entry)
  );

  if (newEntries.length > 0) {
    const appendContent = "\n" + newEntries.join("\n");
    await Deno.writeTextFile(GITIGNORE_PATH, gitignoreContent + appendContent);
    console.log("✅ Updated .gitignore");
  }
}

async function checkAndUpdateCredentials(): Promise<boolean> {
  const credentialsPath = join(CREDENTIALS_DIR, CREDENTIALS_FILE);

  if (!(await exists(credentialsPath))) {
    console.log("\n⚠️  OAuth credentials not found!");
    console.log("\n📝 Action required:");
    console.log("1. Go to https://console.cloud.google.com/");
    console.log("2. Create a project or select an existing one");
    console.log("3. Enable the Google Calendar API");
    console.log("4. Create OAuth 2.0 credentials (Desktop Application)");
    console.log("5. Download the credentials file");
    console.log(`6. Save it as: /path/to/your/project/${credentialsPath}\n`);
    return false;
  }

  try {
    const credentialsText = await Deno.readTextFile(credentialsPath);
    const credentials = JSON.parse(credentialsText) as OAuthCredentials;

    // Validate credentials structure
    if (!credentials.installed) {
      throw new Error("Missing 'installed' configuration");
    }

    const required = [
      "client_id",
      "client_secret",
      "auth_uri",
      "token_uri",
    ] as const;

    const missing = required.filter((field) => !credentials.installed[field]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required fields in credentials: ${missing.join(", ")}`
      );
    }

    console.log("✅ OAuth credentials validated");
    return true;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("\n❌ Invalid JSON in credentials file");
    } else {
      if (error instanceof Error) {
        console.error("\n❌ Error validating credentials:", error.message);
      } else {
        console.error("\n❌ Error validating credentials:", error);
      }
    }
    console.log(
      "\n👉 Please ensure you downloaded the correct OAuth 2.0 credentials file"
    );
    console.log(
      "   The file should contain client ID, client secret, and other OAuth2 fields"
    );
    return false;
  }
}

async function setupEnvFile(): Promise<void> {
  const envPath = "./.env";
  const defaultContent = 'CALENDAR_ID="primary"';

  if (!(await exists(envPath))) {
    await Deno.writeTextFile(envPath, defaultContent);
    console.log("✅ Created .env file with default calendar ID");
  }
}

async function setupCredentials() {
  console.log("🔧 Setting up Alexo Calendar credentials...\n");

  // Create credentials directory
  await ensureDir(CREDENTIALS_DIR);
  console.log("✅ Created credentials directory");

  // Update .gitignore
  await setupGitignore();

  // Setup .env file
  await setupEnvFile();

  // Check and update credentials
  const credentialsReady = await checkAndUpdateCredentials();

  if (credentialsReady) {
    console.log("\n🎉 Setup complete! You can now run 'deno task start'");
  } else {
    console.log("\n⚠️  Setup incomplete:");
    console.log("👉 Please add the OAuth credentials file and run setup again");
  }
}

if (import.meta.main) {
  await setupCredentials();
}
