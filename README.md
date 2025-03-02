# Alexo Calendar

A powerful calendar management library for Deno that simplifies working with calendar events. This library provides an easy-to-use interface for creating, deleting, and managing calendar events programmatically.

## Features

- Create calendar events with natural language processing
- List calendar events
- Delete calendar events
- OAuth2 authentication support
- TypeScript support

## Prerequisites

- [Deno](https://deno.land/) installed on your system
- Google Calendar API credentials

## Authentication Setup

1. Run the setup script:
   ```bash
   deno task setup
   ```

2. Follow the instructions provided by the setup script to:
   - Create a Google Cloud Project
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials
   - Add http://localhost:8080/oauth2callback to the authorized redirect URIs
   - Download and save your credentials file
3. First-time authentication:
   - When you run the application (`deno task start`), your default browser will open automatically
   - Grant permission to your application in the browser
   - The browser window will close automatically once authentication is complete
   - The authentication token will be saved automatically

The setup script will:
- Create the necessary directories
- Update .gitignore to exclude sensitive files
- Guide you through the Google Cloud setup process
- Verify your credentials setup

**Important:** Never commit your `oauth_credentials.json` or `token.json` or `.env` files to version control. The setup script automatically adds these files to .gitignore for your security.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luisferrassini/alexo.git
   cd alexo
   ```

2. Follow the [Authentication Setup](#authentication-setup) instructions above to configure your Google Calendar access.

## Usage

### Basic Example
```typescript
import {
  createCalendarEvent,
  parseTextToEvent,
  listCalendarEvents,
} from "./mod.ts";

// Create an event using natural language
const eventText = "Meeting with team tomorrow at 2pm for 1 hour";
const eventDetails = await parseTextToEvent(eventText);
await createCalendarEvent(eventDetails);

// List all events
const events = await listCalendarEvents();
console.log(events);
```

## API Reference

### `parseTextToEvent(text: string): Promise<CalendarEventDetails>`
Converts natural language text into structured calendar event details.

### `createCalendarEvent(details: CalendarEventDetails): Promise<void>`
Creates a new calendar event with the specified details.

### `deleteCalendarEvent(eventId: string): Promise<void>`
Deletes a calendar event by its ID.

### `listCalendarEvents(): Promise<CalendarEventDetails[]>`
Retrieves a list of calendar events.

## Development

```bash
# Run in development mode with watch
deno task dev

# Run the application
deno task start

# Run tests
deno task test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.