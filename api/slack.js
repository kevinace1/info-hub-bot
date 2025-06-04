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
    // Parse the request body if it's not already parsed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse request body:", e);
        return res.status(400).send("Invalid JSON");
      }
    }

    // Handle URL verification challenge
    if (body && body.type === 'url_verification' && body.challenge) {
      console.log("Responding to Slack URL verification challenge");
      return res.status(200).json({ challenge: body.challenge });
    }
  }

  /* c) All other Slack POSTs → Bolt */
  try {
    await bolt.processEvent(req, res);
  } catch (err) {
    console.error("Slack handler error:", err);
    res.status(500).send("Internal Server Error");
  }
};

/* 3 ─────────────  Disable body-parser  ───────── */
module.exports.config = { api: { bodyParser: false } };
