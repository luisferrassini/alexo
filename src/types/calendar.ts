export interface CalendarEventDetails {
  summary?: string;
  location?: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  attendees?: string[];
  hangoutLink?: string;
}

export interface CalendarEvent extends CalendarEventDetails {
  id: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: string[];
  hangoutLink?: string;
}

export interface ListCalendarEventsOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}
