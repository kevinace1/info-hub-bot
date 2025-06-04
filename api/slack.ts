// api/slack.ts
import { App, LogLevel } from "@slack/bolt";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1) Pull the env vars that must be present
const {
  SLACK_SIGNING_SECRET,
  SLACK_BOT_TOKEN
} = process.env;

// If either is missing, throw an explicit error so it shows in logs
if (!SLACK_SIGNING_SECRET || !SLACK_BOT_TOKEN) {
  throw new Error(
    "Missing SLACK_SIGNING_SECRET or SLACK_BOT_TOKEN. " +
    "Check your Vercel Environment Variables."
  );
}

// 2) Initialize Bolt
const bolt = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  logLevel: LogLevel.DEBUG  // set to DEBUG so we see more info in logs
});

// 3) Simple ping listener
bolt.message(/ping/i, async ({ message, say }) => {
  try {
    await say({
      thread_ts: (message as any).ts,
      text: "pong — bot online ✅"
    });
  } catch (err) {
    console.error("Error inside bolt.message handler:", err);
  }
});

// 4) Export the handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // processEvent will verify the Slack signature and dispatch to bolt.message
    await bolt.processEvent(req, res);
  } catch (err) {
    console.error("Bolt.processEvent failed:", err);
    // Return a generic 500 so Slack knows something went wrong
    res.status(500).send("Internal server error");
  }
}

// No `export const config = { runtime: "edge" }` → this is now a Node.js Function