import { assertEquals, assertExists, assertRejects } from "jsr:@std/assert";
import { CalendarEventDetails } from "../types/calendar.ts";
import { parseTextToEvent } from "../utils/eventParser.ts";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
} from "../services/googleCalendar.ts";

const calendarId = Deno.env.get("CALENDAR_ID") || "primary";

Deno.test("should handle manual event creation and deletion", async () => {
  const eventDetails: CalendarEventDetails = {
    summary: "Team Meeting",
    location: "Conference Room A",
    description: "Monthly team sync-up meeting",
    startTime: "2025-03-02T15:00:00",
    endTime: "2025-03-02T16:00:00",
    timeZone: "America/Sao_Paulo",
  };

  try {
    // List current events
    console.log("\nCurrent events:");
    await listCalendarEvents(calendarId);

    // Create an event
    const event = await createCalendarEvent(eventDetails, calendarId);
    assertExists(event.id);
    console.log("\nCreated event ID:", event.id);

    // List events again to see the new one
    console.log("\nAfter creating:");
    await listCalendarEvents(calendarId);

    // Delete the event
    await deleteCalendarEvent(event.id, calendarId);

    // List events one more time to confirm deletion
    console.log("\nAfter deleting:");
    await listCalendarEvents(calendarId);
  } catch (error) {
    console.error(
      "Test failed:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
});

Deno.test("should parse text input and create event", async () => {
  const textInput = `
Title: Team Brainstorming
Location: Virtual Meeting Room
Description: Quarterly brainstorming session
Start: 2025-03-03T14:00:00
End: 2025-03-03T15:30:00
`;

  const parsedEventDetails = parseTextToEvent(textInput);
  assertEquals(parsedEventDetails, {
    summary: "Team Brainstorming",
    location: "Virtual Meeting Room",
    description: "Quarterly brainstorming session",
    startTime: "2025-03-03T14:00:00",
    endTime: "2025-03-03T15:30:00",
    timeZone: "America/Sao_Paulo",
  });

  try {
    const event = await createCalendarEvent(parsedEventDetails, calendarId);
    assertExists(event.id);

    await deleteCalendarEvent(event.id, calendarId);
  } catch (error) {
    console.error(
      "Test failed:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
});

// Add error case tests
Deno.test("should handle invalid calendar ID", async () => {
  const eventDetails: CalendarEventDetails = {
    summary: "Test Event",
    location: "Test Location",
    description: "Test Description",
    startTime: "2025-03-02T15:00:00",
    endTime: "2025-03-02T16:00:00",
    timeZone: "America/Sao_Paulo",
  };

  await assertRejects(
    async () => {
      await createCalendarEvent(eventDetails, "invalid-calendar-id");
    },
    Error,
    "Failed to create calendar event"
  );
});
