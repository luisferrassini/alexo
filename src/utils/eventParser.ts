import {
  CalendarEventDetails,
  ListCalendarEventsOptions,
} from "../types/calendar.ts";
import {
  parseTextToCreateEventWithAI,
  parseTextToListEventsWithAI,
} from "../services/geminiApi.ts";

export async function parseTextToCreateEvent(
  text: string
): Promise<CalendarEventDetails> {
  try {
    return await parseTextToCreateEventWithAI(text);
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

export async function parseTextToListEvents(
  text: string
): Promise<ListCalendarEventsOptions> {
  try {
    return await parseTextToListEventsWithAI(text);
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
