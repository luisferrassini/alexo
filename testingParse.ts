import {
  parseTextToEvent,
  createCalendarEvent,
  listCalendarEvents,
} from "./main.ts";

const event = await parseTextToEvent("Tenho uma reunião amanhã às 10 horas.");

console.log(event);

createCalendarEvent(event);
listCalendarEvents();
