const WHISPER_DIR = "./whisper.cpp";
const MODELS_DIR = `${WHISPER_DIR}/models`;

async function runCommand(cmd: string[], cwd?: string): Promise<void> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { success } = await command.output();
  if (!success) {
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }
}

async function setupWhisper() {
  console.log("Setting up whisper.cpp...");

  // Clone whisper.cpp if not already present
  if (!(await exists("./whisper.cpp"))) {
    await runCommand([
      "git",
      "clone",
      "https://github.com/ggerganov/whisper.cpp.git",
      "whisper.cpp",
    ]);
  }

  // Build whisper.cpp
  await runCommand(["make"], "./whisper.cpp");

  // Download base model if not present
  if (!(await exists(`${MODELS_DIR}/ggml-base.bin`))) {
    await runCommand(
      ["bash", "./models/download-ggml-model.sh", "base"],
      "./whisper.cpp"
    );
  }

  console.log("\n🎉 Whisper.cpp setup complete!");
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

if (import.meta.main) {
  try {
    await setupWhisper();
  } catch (error) {
    console.error("Error setting up whisper.cpp:", error);
    Deno.exit(1);
  }
}
