# Language App - Anthropic Chat Integration

This app provides a simple chat interface that can send messages to the Anthropic Claude API.

## Features

- Clean, modern chat interface with Tailwind CSS styling
- Real-time message display with timestamps
- Loading states and error handling
- Responsive design for mobile and web
- TypeScript support

## Setup Instructions

### 1. Install Dependencies

First, install the Anthropic SDK:

```bash
npm install @anthropic-ai/sdk
```

### 2. Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-`)

### 3. Set Environment Variables

Create a `.env` file in your project root:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

**Important**: Never commit your API key to version control. Add `.env` to your `.gitignore` file.

### 4. Update the API Service

Once you have the SDK installed and your API key set up, uncomment the real implementation in `app/services/anthropic.ts` and comment out the placeholder code.

### 5. Run the App

```bash
npm start
```

## Project Structure

- `app/index.tsx` - Main chat interface component
- `app/services/anthropic.ts` - API service for Anthropic integration
- `app/_layout.tsx` - Root layout component
- `app/globals.css` - Global styles

## Usage

1. Type a message in the input field at the bottom
2. Press the send button or hit Enter
3. Your message will be sent to Claude and you'll receive a response
4. The conversation history is maintained during your session

## Customization

You can customize the chat interface by:

- Modifying the styling in `app/index.tsx`
- Changing the model or parameters in `app/services/anthropic.ts`
- Adding features like message persistence, user authentication, etc.

## Troubleshooting

- **API Key Issues**: Make sure your API key is correctly set in the environment variables
- **Network Errors**: Check your internet connection and API key validity
- **Styling Issues**: Ensure Tailwind CSS is properly configured in your project

## Security Notes

- Keep your API key secure and never expose it in client-side code
- Consider implementing rate limiting for production use
- Monitor your API usage to avoid unexpected charges
