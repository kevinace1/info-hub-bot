// api/slack.ts
import { App, LogLevel } from "@slack/bolt";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1) Read Slack secrets
const {
  SLACK_SIGNING_SECRET,
  SLACK_BOT_TOKEN
} = process.env;

if (!SLACK_SIGNING_SECRET || !SLACK_BOT_TOKEN) {
  // If either is missing, throw so we see it in logs
  throw new Error(
    "Missing SLACK_SIGNING_SECRET or SLACK_BOT_TOKEN. " +
    "Check your Vercel Environment Variables."
  );
}

// 2) Initialize Slack Bolt
const bolt = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG
});

// 3) Simple ping listener
bolt.message(/ping/i, async ({ message, say }) => {
  try {
    await say({
      thread_ts: (message as any).ts,
      text: "pong — bot online ✅"
    });
  } catch (err) {
    console.error("Error in bolt.message handler:", err);
  }
});

// 4) Export the handler — now with a guard so GETs don’t crash
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only Slack sends POST requests with a signed body.
  // Any browser GET (or other method) gets a harmless 200.
  if (req.method !== "POST") {
    res.status(200).send("OK");
    return;
  }

  try {
    await bolt.processEvent(req, res);
  } catch (err) {
    console.error("Bolt.processEvent failed:", err);
    res.status(500).send("Internal server error");
  }
}

