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

const testEvent = {
  summary: "Test Event",
  description: "This is a test event",
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
};

console.log("Using calendar ID:", Deno.env.get("CALENDAR_ID"));

createCalendarEvent(testEvent, Deno.env.get("CALENDAR_ID"));

listCalendarEvents(Deno.env.get("CALENDAR_ID"));
