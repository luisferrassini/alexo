import { CalendarEventDetails } from "../types/calendar.ts";

export function parseTextToEvent(text: string): CalendarEventDetails {
  // This is a basic implementation - you might want to use a more sophisticated parser
  const lines = text.split("\n");
  const details: Partial<CalendarEventDetails> = {
    timeZone: "America/Sao_Paulo", // default timezone
  };

  for (const line of lines) {
    if (line.startsWith("Title:")) {
      details.summary = line.replace("Title:", "").trim();
    } else if (line.startsWith("Location:")) {
      details.location = line.replace("Location:", "").trim();
    } else if (line.startsWith("Description:")) {
      details.description = line.replace("Description:", "").trim();
    } else if (line.startsWith("Start:")) {
      details.startTime = line.replace("Start:", "").trim();
    } else if (line.startsWith("End:")) {
      details.endTime = line.replace("End:", "").trim();
    }
  }

  // Validate that all required fields are present
  if (
    !details.summary ||
    !details.location ||
    !details.description ||
    !details.startTime ||
    !details.endTime ||
    !details.timeZone
  ) {
    throw new Error("Missing required fields in event text");
  }

  return details as CalendarEventDetails;
}
