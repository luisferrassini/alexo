import type { CalendarEventDetails } from "./src/types/calendar.ts";
import { parseTextToEvent } from "./src/utils/eventParser.ts";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
} from "./src/services/googleCalendar.ts";
import "jsr:@std/dotenv/load";

// Export all the necessary functions and types
export {
  CalendarEventDetails,
  parseTextToEvent,
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
};

console.debug("Environment variables:", {
  GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") ? "present" : "missing",
  CALENDAR_ID: Deno.env.get("CALENDAR_ID") ? "present" : "missing",
});

console.debug("Using calendar ID:", Deno.env.get("CALENDAR_ID"));
