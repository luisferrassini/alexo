import { transcribeAudio } from "../services/whisper.ts";
import { parseTextToEvent } from "../utils/eventParser.ts";
import {
  createCalendarEvent,
  listCalendarEvents,
} from "../services/googleCalendar.ts";

interface VoiceResponse {
  transcription: string;
  action: string;
  event?: unknown;
}

export async function handleVoiceRequest(request: Request): Promise<Response> {
  try {
    const audioBlob = await request.blob();
    const transcription = await transcribeAudio(audioBlob);

    const response: VoiceResponse = {
      transcription,
      action: "unknown",
    };

    // Simple command detection
    const lowerText = transcription.toLowerCase();

    if (
      lowerText.includes("create") ||
      lowerText.includes("schedule") ||
      lowerText.includes("mark") ||
      lowerText.includes("add") ||
      lowerText.includes("meeting")
    ) {
      response.action = "create";
      const eventDetails = await parseTextToEvent(transcription);
      const event = await createCalendarEvent(eventDetails);
      response.event = event;
    } else if (
      lowerText.includes("list") ||
      lowerText.includes("show") ||
      lowerText.includes("display")
    ) {
      response.action = "list";
      response.event = await listCalendarEvents();
    }
    // } else if (
    //   lowerText.includes("deletar") ||
    //   lowerText.includes("remover") ||
    //   lowerText.includes("cancelar")
    // ) {
    //   response.action = "delete";
    //   // Note: You'll need to extract the event ID from the transcription
    //   // This is a simplified example
    //   const eventId = ""; // Extract event ID from transcription
    //   if (eventId) {
    //     await deleteCalendarEvent(eventId);
    //     response.event = { deleted: true, eventId };
    //   }
    // }

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
