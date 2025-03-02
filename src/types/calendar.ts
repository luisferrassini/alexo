export interface CalendarEventDetails {
  summary?: string;
  location?: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
}

export interface CalendarEvent extends CalendarEventDetails {
  id: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  location: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}
