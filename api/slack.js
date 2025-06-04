// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG, // Changed to DEBUG for better logging
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
      // Use a Promise to handle the async body reading
      const body = await new Promise((resolve, reject) => {
        let rawBody = '';
        
        req.on('data', chunk => {
          rawBody += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            resolve(JSON.parse(rawBody));
          } catch (e) {
            console.error("JSON parse error:", e);
            reject(e);
          }
        });
        
        req.on('error', reject);
      });

      console.log("Request body type:", body.type);

      // Handle URL verification challenge
      if (body.type === 'url_verification') {
        console.log("URL verification challenge received");
        return res.status(200).json({ challenge: body.challenge });
      }

      // For other events, let Bolt handle them
      // Create a new request object for Bolt
      const mockReq = {
        ...req,
        body: JSON.stringify(body),
        rawBody: JSON.stringify(body)
      };

      await bolt.processEvent(mockReq, res);
      
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

/* 3 ─────────────  Disable body-parser  ───────── */
module.exports.config = { api: { bodyParser: false } };
