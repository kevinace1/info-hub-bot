// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

// Import our new utilities
const { parseCommand, isValidCommand, getCommandSuggestions } = require("../utils/parser");
const { formatError, formatCommandSuggestions } = require("../utils/responses");
const { getAllCommandNames } = require("../config/commands");
const { handleHelp, handleStatus, handleInfo, handlePing } = require("../commands/basic");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG,
  processBeforeResponse: true,
});

/* 1 ─────────────  Command Router  ─────────── */
async function routeCommand(command, args, fullArgs) {
  console.log(`Routing command: ${command} with args: [${args.join(', ')}]`);
  
  try {
    switch (command) {
      case 'help':
        return handleHelp(args[0]);
      
      case 'status':
        return handleStatus();
      
      case 'info':
        return handleInfo();
      
      case 'ping':
        return handlePing();
      
      // Placeholder for future commands
      case 'ask':
      case 'summarize':
      case 'explain':
        return formatError(`"${command}" command is coming soon! 🚧`);
      
      case 'weather':
      case 'news':
      case 'time':
        return formatError(`"${command}" command is coming soon! 🚧`);
      
      default:
        // Command not found - suggest alternatives
        const suggestions = getCommandSuggestions(command, getAllCommandNames());
        return formatCommandSuggestions(command, suggestions);
    }
  } catch (error) {
    console.error(`Error in routeCommand for "${command}":`, error);
    return formatError(`Sorry, there was an error processing the "${command}" command.`);
  }
}

/* 2 ─────────────  Vercel handler  ───────────── */
module.exports = async (req, res) => {
  console.log(`${req.method} request received`);
  
  /* a) Browser GET → quick liveness */
  if (req.method === "GET") {
    return res.status(200).send("👍 Info Hub Bot - Alive and Ready!");
  }

  /* b) Handle POST requests */
  if (req.method === "POST") {
    try {
      // Read the raw body
      const rawBody = await new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
      });

      console.log("Raw body received, length:", rawBody.length);
      
      // Parse the body
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (e) {
        console.error("JSON parse error:", e);
        return res.status(400).json({ error: "Invalid JSON" });
      }

      console.log("Request body type:", parsedBody.type);

      // Handle URL verification challenge
      if (parsedBody.type === 'url_verification') {
        console.log("URL verification challenge received");
        return res.status(200).json({ challenge: parsedBody.challenge });
      }

      // Handle event_callback
      if (parsedBody.type === 'event_callback') {
        const event = parsedBody.event;
        console.log("Event type:", event.type);
        
        // Handle app_mention events
        if (event.type === 'app_mention') {
          console.log("App mention received:", event.text);
          
          // Get bot user ID from the authorizations
          const botUserId = parsedBody.authorizations[0].user_id;
          
          // Parse the command
          const { command, args, fullArgs } = parseCommand(event.text, botUserId);
          console.log("Parsed command:", { command, args, fullArgs });
          
          if (!command) {
            // No command provided, show help
            const response = handleHelp();
            try {
              await bolt.client.chat.postMessage({
                channel: event.channel,
                thread_ts: event.ts,
                text: response.text
              });
              console.log("Help response sent successfully");
            } catch (error) {
              console.error("Error sending help response:", error);
            }
          } else {
            // Route the command
            const response = await routeCommand(command, args, fullArgs);
            try {
              await bolt.client.chat.postMessage({
                channel: event.channel,
                thread_ts: event.ts,
                text: response.text
              });
              console.log(`Response sent successfully for command: ${command}`);
            } catch (error) {
              console.error(`Error sending response for command "${command}":`, error);
            }
          }
        }
        
        // Handle regular message events (for direct messages)
        if (event.type === 'message' && event.text && !event.bot_id) {
          console.log("Direct message received:", event.text);
          
          // Simple ping response for direct messages
          if (event.text.toLowerCase().includes('ping')) {
            try {
              await bolt.client.chat.postMessage({
                channel: event.channel,
                thread_ts: event.ts,
                text: "pong — bot online ✅"
              });
              console.log("Ping response sent successfully");
            } catch (error) {
              console.error("Error sending ping response:", error);
            }
          }
        }
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).send('OK');
      
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

/* 3 ─────────────  Disable body-parser  ───────────── */
module.exports.config = { api: { bodyParser: false } };
