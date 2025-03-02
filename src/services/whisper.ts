export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Convert blob to temporary file
  const tempFile = await Deno.makeTempFile({ suffix: ".webm" });
  const audioArray = new Uint8Array(await audioBlob.arrayBuffer());
  await Deno.writeFile(tempFile, audioArray);

  try {
    // Convert webm to wav using ffmpeg
    const wavFile = tempFile.replace(".webm", ".wav");
    const ffmpegCmd = new Deno.Command("ffmpeg", {
      args: [
        "-i",
        tempFile,
        "-ar",
        "16000", // Whisper expects 16kHz
        "-ac",
        "1", // Mono audio
        "-c:a",
        "pcm_s16le", // 16-bit PCM
        wavFile,
      ],
    });

    const ffmpegResult = await ffmpegCmd.output();
    if (!ffmpegResult.success) {
      throw new Error("Failed to convert audio format");
    }

    // Run whisper.cpp
    const whisperCmd = new Deno.Command("./whisper.cpp/build/bin/whisper-cli", {
      args: [
        "-m",
        "./whisper.cpp/models/ggml-base.bin",
        "-f",
        wavFile,
        "--no-prints",
        "--no-timestamps",
      ],
    });

    const whisperResult = await whisperCmd.output();
    if (!whisperResult.success) {
      throw new Error("Whisper transcription failed");
    }

    const textOutput = new TextDecoder().decode(whisperResult.stdout);

    return textOutput;
  } finally {
    // Cleanup temporary files
    try {
      await Deno.remove(tempFile);
      await Deno.remove(tempFile.replace(".webm", ".wav"));
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
  }
}
