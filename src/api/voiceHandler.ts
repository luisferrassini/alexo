import { transcribeAudio } from "../services/whisper.ts";
import { parseTextToEvent } from "../utils/eventParser.ts";
import {
  createCalendarEvent,
  listCalendarEvents,
} from "../services/googleCalendar.ts";
import { determineActionFromText } from "../services/geminiApi.ts";

interface VoiceResponse {
  transcription: string;
  action: string;
  event?: unknown;
  reason?: string;
}

export async function handleVoiceRequest(request: Request): Promise<Response> {
  try {
    const audioBlob = await request.blob();
    const transcription = await transcribeAudio(audioBlob);

    // Let Gemini AI determine the action
    const { action, reason } = await determineActionFromText(transcription);

    const response: VoiceResponse = {
      transcription,
      action,
      reason,
    };

    if (action === "create") {
      const eventDetails = await parseTextToEvent(transcription);
      const event = await createCalendarEvent(eventDetails);
      response.event = event;
    } else if (action === "list") {
      response.event = await listCalendarEvents();
    }

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
