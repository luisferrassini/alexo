# Alexo - AI Voice Calendar Assistant

A powerful calendar management library for Deno that simplifies working with calendar events. This library provides an easy-to-use interface for creating, deleting, and managing calendar events through voice commands.

![Screenshot from 2025-03-04 09-47-12](https://github.com/user-attachments/assets/65bcd6fd-6e97-4e1e-9ae3-feab00e8382d)
![Screenshot from 2025-03-04 09-39-35](https://github.com/user-attachments/assets/6ea27e3e-cc3e-4a4c-8039-8ac5250d56a1)

## Features

- Voice interface for calendar management
- Create calendar events with natural language processing using Google's Gemini AI
- Speech-to-text conversion using Whisper
- List calendar events
- Delete calendar events
- OAuth2 authentication support
- TypeScript support
- Configurable timezone and locale settings

## Prerequisites

- [Deno](https://deno.land/) installed on your system
- [FFmpeg](https://ffmpeg.org/) installed on your system (for audio processing)
- Google Calendar API credentials
- Google Gemini AI API key

## Setup

1. Run the calendar setup script:
   ```bash
   deno task setup-calendar
   ```

2. Follow the instructions provided by the setup script to:
   - Create a Google Cloud Project
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials
   - Download and save your credentials file

3. Set up Whisper for voice recognition:
   ```bash
   deno task setup-whisper
   ```
   This will:
   - Clone the whisper.cpp repository
   - Build the whisper.cpp library
   - Download the base model

4. Set up your Gemini AI API key:
   - Create a `.env` file in the root directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

5. First-time authentication:
   - When you run the application (`deno task start`), your default browser will open automatically
   - Grant permission to your application in the browser
   - The browser window will close automatically once authentication is complete
   - The authentication token will be saved automatically

The setup scripts will:
- Create the necessary directories
- Update .gitignore to exclude sensitive files
- Guide you through the Google Cloud setup process
- Verify your credentials setup
- Set up Whisper for voice recognition

**Important:** Never commit your `oauth_credentials.json`, `token.json`, or `.env` files to version control. The setup script automatically adds these files to .gitignore for your security.

**Extra note:** You might need to add your google account email to the test users list in the Google Calendar API console.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luisferrassini/alexo.git
   cd alexo
   ```

2. Follow the [Setup](#setup) instructions above to configure all components.

## Using the Voice Interface

1. Start the server:
   ```bash
   deno task start
   ```

2. Open your browser to `http://localhost:8000`

3. Click the "Start Recording" button and speak your command. Examples:
   - "Create a meeting with the team tomorrow at 2 PM for one hour"
   - "Show me my upcoming events"
   - "Schedule a doctor's appointment next Monday at 3 PM"

The interface will:
- Transcribe your speech using Whisper
- Parse the command using Gemini AI
- Execute the appropriate calendar action
- Display the results with a clean, modern interface

## Configuration

### Date and Locale Settings

The application uses a centralized configuration for timezone and locale settings, located in `src/config/dateConfig.ts`:

```typescript
export const DATE_CONFIG = {
  timezone: "America/Sao_Paulo",
  locale: "pt-BR",
} as const;
```

Modify these settings to match your desired timezone and locale. The default configuration is set to Brazilian timezone (America/Sao_Paulo) and Brazilian Portuguese locale (pt-BR).

### Use an specific calendar

You can use an specific calendar by setting the `CALENDAR_ID` on the `.env` file.

```bash
CALENDAR_ID=your_calendar_id_here@group.calendar.google.com
```

#### How to create a new calendar?

1. Go to your [Google Calendar](https://calendar.google.com/calendar)
2. Click on the "Create new calendar" button on "Other calendars" 
3. Name your new calendar (Suggestion: Name it as "Alexo")
4. Click on "Create calendar"

#### How to get the calendar id?

1. Go to your [Google Calendar](https://calendar.google.com/calendar)
3. Click on the three dots icon on the side of the calendar you want to use
4. Click on "Settings and sharing"
5. Scroll down to "Integrate calendar"
6. Copy the "Calendar ID"

### Keyboard Shortcuts

To quickly access the application, you can set up keyboard shortcuts based on your operating system:

#### Linux
1. Open your system's keyboard settings
2. Create a new custom shortcut
3. Set the command to: `xdg-open http://localhost:8000/`
4. Assign your preferred key combination (e.g. Super+A)

#### macOS
1. Open System Preferences > Keyboard > Shortcuts
2. Click "App Shortcuts" and add a new shortcut
3. Set the URL to: `http://localhost:8000/`
4. Assign your preferred key combination (e.g. ⌘+⇧+A)

#### Windows
1. Create a new shortcut on your desktop
2. Set the target to: `start http://localhost:8000/`
3. Right-click the shortcut and select Properties
4. In the "Shortcut" tab, click in "Shortcut key" and press your desired key combination

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

## Future Plans

- [ ] Add support for other AI providers (OpenAI, Anthropic, etc)
- [ ] Add support for other local LLMs (Llama, Mistral, etc)
- [ ] Add support for more voice commands (delete, update events)
- [ ] Add support for more configuration options when creating or listing events
- [ ] Fix language detection (sometimes it creates the event in English even if the user speaks Brazilian Portuguese)
- [ ] Add support for multiple calendars
- [ ] Deploy to a cloud service (AWS, GCP, etc) and make it available as a web service
- [ ] Make a better UI/UX
- [ ] Add support for mobile devices
