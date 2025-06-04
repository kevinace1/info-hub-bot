// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG,
});

/* 1 ─────────────  Simple ping-pong  ─────────── */
bolt.message(/ping/i, async ({ message, say }) => {
  console.log("Ping message received:", message.text);
  await say({ thread_ts: message.ts, text: "pong — bot online ✅" });
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

      // Handle URL verification challenge
      if (parsedBody.type === 'url_verification') {
        console.log("URL verification challenge received");
        return res.status(200).json({ challenge: parsedBody.challenge });
      }

      // For other events, let Bolt handle them
      // Set the raw body back on the request for Bolt
      req.body = rawBody;
      req.rawBody = rawBody;
      
      // Use Bolt's processEvent method
      await bolt.processEvent(req, res);
      
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
