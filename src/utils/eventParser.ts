import { CalendarEventDetails } from "../types/calendar.ts";
import { parseEventWithAI } from "../services/geminiApi.ts";

export async function parseTextToEvent(
  text: string
): Promise<CalendarEventDetails> {
  try {
    return await parseEventWithAI(text);
  } catch (error) {
    if (error instanceof Error) {
      console.error("AI parsing failed:", error.message);
      throw new Error("Failed to parse event text: " + error.message);
    } else {
      console.error("AI parsing failed:", error);
      throw new Error("Failed to parse event text: " + error);
    }
  }
}
