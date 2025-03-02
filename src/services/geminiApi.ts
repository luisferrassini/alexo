import { CalendarEventDetails } from "../types/calendar.ts";
import { DATE_CONFIG } from "../config/dateConfig.ts";
import "jsr:@std/dotenv/load";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const date = new Date().toLocaleDateString(DATE_CONFIG.locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const time = new Date().toLocaleTimeString(DATE_CONFIG.locale, {
  hour: "2-digit",
  minute: "2-digit",
});

export async function parseEventWithAI(
  text: string
): Promise<CalendarEventDetails> {
  const prompt = `
    Parse this text into a calendar event: "${text}"

    The text is in ${DATE_CONFIG.locale}.
    Today is ${date}. Right now is ${time}.
    The timezone is ${DATE_CONFIG.timezone}.
    
    Return ONLY a raw JSON object with these fields:
    - summary (title of the event)
    - description (any additional details or, if there's no additional details, just return the full text)
    - startTime (in ISO format)
    - endTime (in ISO format, if not specified, assume 1 hour duration)
    - location (if mentioned, otherwise exclude this field)
    
    DO NOT include any markdown, code blocks, or additional text. Return ONLY the JSON object.
  `;

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  try {
    const text = data.candidates[0].content.parts[0].text.trim();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsedEvent = JSON.parse(jsonText);

    return {
      ...parsedEvent,
      timeZone: DATE_CONFIG.timezone, // using config timezone
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Raw API response:",
        data.candidates[0].content.parts[0].text
      );
      throw new Error(`Failed to parse API response: ${error.message}`);
    } else {
      throw new Error(`Failed to parse API response: ${error}`);
    }
  }
}

export async function determineActionFromText(text: string): Promise<{
  action: "create" | "list" | "unknown";
  reason: string;
}> {
  const prompt = `
    Analyze this text and determine if the user wants to:
    1. Create/schedule a calendar event
    2. List/show existing calendar events

    If the user says he has something to do, then the action is "create".
    If the user says he wants to see his calendar, then the action is "list".
    If the user says he doesn't know what to do, then the action is "unknown".
    
    Text: "${text}"
    
    Return ONLY a raw JSON object with these fields:
    - action: either "create", "list", or "unknown"
    - reason: brief explanation of why you chose this action
    
    DO NOT include any markdown, code blocks, or additional text. Return ONLY the JSON object.
  `;

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  try {
    const text = data.candidates[0].content.parts[0].text.trim();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(
      "Raw API response:",
      data.candidates[0].content.parts[0].text
    );
    throw new Error(`Failed to parse API response: ${error}`);
  }
}
