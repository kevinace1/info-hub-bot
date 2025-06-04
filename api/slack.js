// api/slack.js
const { App, LogLevel } = require("@slack/bolt");

/* 0 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.ERROR,
});

/* 1 ─────────────  Simple ping-pong  ─────────── */
bolt.message(/ping/i, async ({ message, say }) => {
  await say({ thread_ts: message.ts, text: "pong — bot online ✅" });
});

/* 2 ─────────────  Vercel handler  ───────────── */
module.exports = async (req, res) => {
  /* a) Browser GET → quick liveness */
  if (req.method === "GET") {
    return res.status(200).send("👍 Alive");
  }

  /* b) Handle Slack URL verification challenge */
  if (req.method === "POST") {
    // Read raw body since bodyParser is disabled
    let rawBody = '';
    
    // Collect the raw body data
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse the body
        const body = JSON.parse(rawBody);
        
        // Handle URL verification challenge
        if (body && body.type === 'url_verification' && body.challenge) {
          console.log("Responding to Slack URL verification challenge");
          return res.status(200).json({ challenge: body.challenge });
        }
        
        // For other events, let Bolt handle them
        // We need to recreate the request with the parsed body for Bolt
        req.body = rawBody;
        await bolt.processEvent(req, res);
        
      } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).send("Internal Server Error");
      }
    });
    
    return; // Important: return here to prevent further execution
  }

  /* c) Handle other methods */
  res.status(405).send("Method Not Allowed");
};

/* 3 ─────────────  Disable body-parser  ───────── */
module.exports.config = { api: { bodyParser: false } };
