import { authorize } from "./oauth.ts";
import {
  CalendarEventDetails,
  CalendarEvent,
  GoogleCalendarEvent,
} from "../types/calendar.ts";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

interface ListOptions {
  timeMin?: string;
  maxResults?: number;
}

interface GoogleCalendarError {
  message: string;
  code?: number;
}

export async function createCalendarEvent(
  eventDetails: CalendarEventDetails,
  calendarId?: string
): Promise<CalendarEvent> {
  try {
    const auth = await authorize();

    const parsedCalendarId = parseCalendarId(calendarId);

    const event = {
      summary: eventDetails.summary || "New Event",
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startTime,
        timeZone: eventDetails.timeZone || "UTC",
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: eventDetails.timeZone || "UTC",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${parsedCalendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("Event created successfully:", data.htmlLink);
    return data;
  } catch (error) {
    const calendarError = error as GoogleCalendarError;
    console.error("Error creating event:", calendarError.message);
    throw new Error(
      `Failed to create calendar event: ${calendarError.message}`
    );
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  calendarId?: string
): Promise<void> {
  try {
    const auth = await authorize();

    const parsedCalendarId = parseCalendarId(calendarId);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${parsedCalendarId}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${await response.text()}`);
    }

    console.log("Event deleted successfully");
  } catch (error) {
    const calendarError = error as GoogleCalendarError;
    console.error("Error deleting event:", calendarError.message);
    throw new Error(
      `Failed to delete calendar event: ${calendarError.message}`
    );
  }
}

export async function listCalendarEvents(
  calendarId?: string,
  options: ListOptions = {}
): Promise<CalendarEvent[]> {
  try {
    const auth = await authorize();

    const parsedCalendarId = parseCalendarId(calendarId);

    const params = new URLSearchParams({
      timeMin: options.timeMin || new Date().toISOString(),
      maxResults: (options.maxResults || 10).toString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${parsedCalendarId}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list events: ${await response.text()}`);
    }

    const data = await response.json();
    const events = data.items;

    if (!events || events.length === 0) {
      console.log("No upcoming events found.");
      return [];
    }

    console.log("Upcoming events:");
    events.forEach((event: GoogleCalendarEvent) => {
      const start = event.start?.dateTime || event.start?.dateTime;
      console.log(`- ${start} - ${event.summary} (ID: ${event.id})`);
    });

    return events;
  } catch (error) {
    const calendarError = error as GoogleCalendarError;
    console.error("Error listing events:", calendarError.message);
    throw new Error(`Failed to list calendar events: ${calendarError.message}`);
  }
}

const parseCalendarId = function (calendarId?: string) {
  return calendarId || Deno.env.get("CALENDAR_ID") || "primary";
};
