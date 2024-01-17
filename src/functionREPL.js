import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'readline';
dotenv.config();
const openai = new OpenAI({ key: process.env.OPENAI_API_KEY });
function coloredLog(message, color) {
    // ANSI escape codes for colors
    const colors = {
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m',
    };
  
    if (colors[color]) {
      console.log(`${colors[color]}${message}${colors.reset}`);
    } else {
      console.log(message);
    }
  }

  
  function getCurrentWeather(location, unit = "fahrenheit") {
    if (location.toLowerCase().includes("tokyo")) {
      return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
    } else if (location.toLowerCase().includes("san francisco")) {
      return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
    } else if (location.toLowerCase().includes("paris")) {
      return JSON.stringify({ location: "Paris", temperature: "22", unit: "fahrenheit" });
    } else {
      return JSON.stringify({ location, temperature: "unknown" });
    }
  }
let messages = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
async function askQuestion(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}
async function runConversation() {

  let keepChatting = true;
  while (keepChatting) {
    const userMessage = await askQuestion("You: ");
    if (userMessage === '!exit') {
      keepChatting = false;
      break;
    }
    messages.push({ role: "user", content: userMessage });
    console.log("Message[]", messages);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "get_current_weather",
            description: "Get the current weather in a given location",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The city and state, e.g. San Francisco, CA",
                },
                unit: { type: "string", enum: ["celsius", "fahrenheit"] },
              },
              required: ["location"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });
    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);
    
    if (responseMessage.tool_calls) {
      const toolCalls = responseMessage.tool_calls;
      console.log('There was a tool call', toolCalls);
      const availableFunctions = {
        get_current_weather: getCurrentWeather,
      };
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResponse = functionToCall(functionArgs.location, functionArgs.unit);
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });
      }
      const toolEvaluatedResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      });
      messages.push(toolEvaluatedResponse.choices[0].message);
      coloredLog(`AI: ${toolEvaluatedResponse.choices[0].message.content}`, "cyan");
    } else {
        coloredLog(`AI: ${responseMessage.content}`, "cyan");
    }
  }
  rl.close();
}
runConversation().catch(console.error);