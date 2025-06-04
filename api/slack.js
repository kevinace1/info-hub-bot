// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG,
  processBeforeResponse: true,
});

/* 1 ─────────────  Simple ping-pong  ─────────── */
bolt.message(/ping/i, async ({ message, say }) => {
  console.log("Ping message received:", message.text);
  await say({ thread_ts: message.ts, text: "pong — bot online ✅" });
});

/* 2 ─────────────  App mention ping-pong  ─────────── */
bolt.event('app_mention', async ({ event, say }) => {
  console.log("App mention received:", event.text);
  
  // Check if the mention contains "ping"
  if (event.text.toLowerCase().includes('ping')) {
    await say({ 
      channel: event.channel,
      thread_ts: event.ts, 
      text: "pong — bot online ✅" 
    });
  }
});

/* 3 ─────────────  Vercel handler  ───────────── */
module.exports = async (req, res) => {
  console.log(`${req.method} request received`);
  
  /* a) Browser GET → quick liveness */
  if (req.method === "GET") {
    return res.status(200).send("👍 Alive");
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

      // Handle event_callback (this is what we're getting)
      if (parsedBody.type === 'event_callback') {
        const event = parsedBody.event;
        console.log("Event type:", event.type);
        
        // Handle app_mention events directly
        if (event.type === 'app_mention') {
          console.log("App mention received:", event.text);
          
          // Check if the mention contains "ping"
          if (event.text.toLowerCase().includes('ping')) {
            // Use the Slack Web API directly to respond
            try {
              await bolt.client.chat.postMessage({
                channel: event.channel,
                thread_ts: event.ts,
                text: "pong — bot online ✅"
              });
              console.log("Response sent successfully");
            } catch (error) {
              console.error("Error sending message:", error);
            }
          }
        }
        
        // Handle regular message events
        if (event.type === 'message' && event.text && event.text.match(/ping/i)) {
          console.log("Ping message received:", event.text);
          try {
            await bolt.client.chat.postMessage({
              channel: event.channel,
              thread_ts: event.ts,
              text: "pong — bot online ✅"
            });
            console.log("Response sent successfully");
          } catch (error) {
            console.error("Error sending message:", error);
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

/* 4 ─────────────  Disable body-parser  ───────────── */
module.exports.config = { api: { bodyParser: false } };
