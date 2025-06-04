// api/slack.ts
import { App, LogLevel } from "@slack/bolt";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1) Read the environment variables Vercel populated for us
const {
  SLACK_SIGNING_SECRET,   // e.g. xxxxxxx
  SLACK_BOT_TOKEN         // e.g. xoxb-xxxx
} = process.env;

// 2) Initialize Slack Bolt
const bolt = new App({
  signingSecret: SLACK_SIGNING_SECRET!,
  token: SLACK_BOT_TOKEN!,
  logLevel: LogLevel.WARN,
});

// 3) When the bot is mentioned with the text “ping”, reply “pong — bot online ✅”
bolt.message(/ping/i, async ({ message, say }) => {
  // message.ts is the Slack timestamp; replying in thread_ts places it as a thread.
  await say({
    thread_ts: (message as any).ts,
    text: "pong — bot online ✅"
  });
});

// 4) Export a handler that Vercel can invoke as an HTTP Endpoint
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Bolt’s processEvent will verify Slack’s POST signature 
  // and dispatch to the `bolt.message` handler above.
  await bolt.processEvent(req, res);
}

// 5) Use Vercel's Edge runtime (fast cold-start)
export const config = { runtime: "edge" };
