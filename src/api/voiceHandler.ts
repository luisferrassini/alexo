import { transcribeAudio } from "../services/whisper.ts";
import {
  parseTextToCreateEvent,
  parseTextToListEvents,
} from "../utils/eventParser.ts";
import {
  createCalendarEvent,
  listCalendarEvents,
} from "../services/googleCalendar.ts";
import { parseTextToDetermineActionWithAI } from "../services/geminiApi.ts";

interface VoiceResponse {
  transcription: string;
  action: string;
  event?: unknown;
  events?: unknown;
  reason?: string;
  actionDetails?: string;
}

export async function handleVoiceRequest(request: Request): Promise<Response> {
  try {
    const audioBlob = await request.blob();
    const transcription = await transcribeAudio(audioBlob);

    // Let Gemini AI determine the action
    const { action, reason } = await parseTextToDetermineActionWithAI(
      transcription
    );

    const response: VoiceResponse = {
      transcription,
      action,
      reason,
    };

    if (action === "create") {
      const eventDetails = await parseTextToCreateEvent(transcription);
      response.event = await createCalendarEvent(eventDetails);
      response.actionDetails = `Creating a new calendar event: "${eventDetails.summary}"`;
    } else if (action === "list") {
      const options = await parseTextToListEvents(transcription);
      response.events = await listCalendarEvents(options);

      let timeRange = "upcoming events";
      if (options.timeMin && options.timeMax) {
        timeRange = `events from ${new Date(
          options.timeMin
        ).toLocaleDateString()} to ${new Date(
          options.timeMax
        ).toLocaleDateString()}`;
      }

      const maxResults = options.maxResults
        ? ` (limited to ${options.maxResults} events)`
        : "";
      response.actionDetails = `Listing ${timeRange}${maxResults}`;
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
