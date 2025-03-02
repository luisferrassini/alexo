import { authorize } from "./oauth.ts";
import {
  CalendarEventDetails,
  CalendarEvent,
  GoogleCalendarEvent,
  ListCalendarEventsOptions,
} from "../types/calendar.ts";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

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
      summary: `${eventDetails.summary || "New Event"} - Powered by Alexo`,
      location: eventDetails.location,
      description: `${eventDetails.description} - Powered by Alexo`,
      start: {
        dateTime: eventDetails.startTime,
        timeZone: eventDetails.timeZone || "UTC",
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: eventDetails.timeZone || "UTC",
      },
      attendees: eventDetails.attendees,
      hangoutLink: eventDetails.hangoutLink,
      reminders: {
        useDefault: true,
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
  options: ListCalendarEventsOptions = {},
  calendarId?: string
): Promise<CalendarEvent[]> {
  try {
    const auth = await authorize();

    const parsedCalendarId = parseCalendarId(calendarId);

    const params = new URLSearchParams({
      timeMin: options.timeMin || new Date().toISOString(),
      timeMax:
        options.timeMax ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week ahead
      maxResults: (options.maxResults || 10).toString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    // Fetch events from the specified calendar
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
    let events = data.items || [];

    // If calendar is not primary, also fetch primary calendar events
    if (parsedCalendarId !== "primary") {
      const primaryResponse = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!primaryResponse.ok) {
        throw new Error(
          `Failed to list primary events: ${await primaryResponse.text()}`
        );
      }

      const primaryData = await primaryResponse.json();
      const primaryEvents = primaryData.items || [];

      // Merge and sort events from both calendars
      events = [...events, ...primaryEvents].sort((a, b) => {
        const aStart = a.start?.dateTime || a.start?.date;
        const bStart = b.start?.dateTime || b.start?.date;
        return new Date(aStart).getTime() - new Date(bStart).getTime();
      });
    }

    if (events.length === 0) {
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
