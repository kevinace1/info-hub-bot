// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG,
  processBeforeResponse: true, // Important for serverless
});

/* 1 ─────────────  Simple ping-pong  ─────────── */
bolt.message(/ping/i, async ({ message, say }) => {
  console.log("Ping message received:", message.text);
  await say({ thread_ts: message.ts, text: "pong — bot online ✅" });
});

/* 1b ─────────────  App mention ping-pong  ─────────── */
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

/* 2 ─────────────  Vercel handler  ───────────── */
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
      
      // Parse the body to check for URL verification
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (e) {
        console.error("JSON parse error:", e);
        return res.status(400).json({ error: "Invalid JSON" });
      }

      console.log("Request body type:", parsedBody.type);
      console.log("Full event data:", JSON.stringify(parsedBody, null, 2));

      // Handle URL verification challenge
      if (parsedBody.type === 'url_verification') {
        console.log("URL verification challenge received");
        return res.status(200).json({ challenge: parsedBody.challenge });
      }

      // For other events, create a proper request object for Bolt
      const boltRequest = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: rawBody,
        rawBody: rawBody,
      };

      // Create a custom response object that Bolt can use
      let responseData = { statusCode: 200, headers: {}, body: '' };
      const boltResponse = {
        status: (code) => {
          responseData.statusCode = code;
          return boltResponse;
        },
        header: (name, value) => {
          responseData.headers[name] = value;
          return boltResponse;
        },
        send: (body) => {
          responseData.body = body;
          return boltResponse;
        },
        json: (obj) => {
          responseData.headers['Content-Type'] = 'application/json';
          responseData.body = JSON.stringify(obj);
          return boltResponse;
        },
        end: () => boltResponse,
      };

      // Process the event with Bolt
      await bolt.processEvent(boltRequest, boltResponse);
      
      // Send the response
      res.status(responseData.statusCode);
      Object.keys(responseData.headers).forEach(key => {
        res.setHeader(key, responseData.headers[key]);
      });
      
      if (responseData.body) {
        res.send(responseData.body);
      } else {
        res.end();
      }
      
    } catch (error) {
      console.error("Error processing request:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

/* 3 ─────────────  Disable body-parser  ───────── */
module.exports.config = { api: { bodyParser: false } };
