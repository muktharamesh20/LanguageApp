// Anthropic API service
// Note: You'll need to install @anthropic-ai/sdk and set up your API key

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicResponse {
  content: string;
  error?: string;
}

// For now, this is a placeholder implementation
// To use the real Anthropic API, you'll need to:
// 1. Install: npm install @anthropic-ai/sdk
// 2. Set your API key as an environment variable: ANTHROPIC_API_KEY
// 3. Replace this implementation with the actual API call

// export const sendToAnthropic = async (
//   message: string
// ): Promise<AnthropicResponse> => {
//   try {
//     // Simulate API delay
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     // Placeholder response - replace with actual API call
//     return {
//       content: `I received your message: "${message}". This is a placeholder response. To get real responses from Claude, please:

// 1. Install the Anthropic SDK: npm install @anthropic-ai/sdk
// 2. Set your API key: export ANTHROPIC_API_KEY=your_key_here
// 3. Replace this placeholder with the actual API implementation

// Here's what your message would look like to Claude: "${message}"`,
//     };
//   } catch (error) {
//     return {
//       content: "",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// };

// Implementation using n8n webhook as intermediary
const N8N_WEBHOOK_URL =
  "https://n8n.astroroles.com/webhook/441ad769-9c31-4a66-9eda-dc895bbb8b86";

export const sendToAnthropic = async (
  message: string
): Promise<AnthropicResponse> => {
  try {
    console.log("Sending message to n8n:", message);

    // Encode the message for URL parameters
    const encodedMessage = encodeURIComponent(message);
    const fullUrl = `${N8N_WEBHOOK_URL}?prompt=${encodedMessage}`;

    console.log("Full URL:", fullUrl);

    // Make GET request to n8n webhook with prompt as query parameter
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);

    // Extract the response content from n8n's response
    // The response structure is: {"content":[{"type":"text","text":"actual response"}]}
    const content =
      data.content?.[0]?.text ||
      data.content ||
      data.text ||
      data.message ||
      JSON.stringify(data);

    console.log("Extracted content:", content);

    return {
      content: content,
    };
  } catch (error) {
    console.error("Error in sendToAnthropic:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
