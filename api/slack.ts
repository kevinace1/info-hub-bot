// api/slack.ts
import { App, LogLevel } from "@slack/bolt";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/* ---------- 0.  Bolt instance ---------- */
const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  token: process.env.SLACK_BOT_TOKEN!,
  logLevel: LogLevel.ERROR,
});

/* Simple liveness test */
bolt.message(/ping/i, async ({ message, say }) => {
  await say({
    thread_ts: (message as any).ts,
    text: "pong — bot online ✅",
  });
});

/* ---------- 1. Helper to grab raw body (Slack needs it) ---------- */
function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req
      .on("data", (c) => chunks.push(c as Buffer))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", reject);
  });
}

/* ---------- 2. Vercel handler ---------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    /* a) Handle Slack's initial URL-verification */
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {
      const raw = await readRawBody(req);
      const payload = JSON.parse(raw.toString());
      if (payload.type === "url_verification" && payload.challenge) {
        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(payload.challenge);
      }
    }

    /* b) All other events are passed to Bolt */
    await bolt.processEvent(req, res);
  } catch (err) {
    /* Log & return 500 so Vercel surfaces the stack trace */
    console.error("Slack handler error:", err);
    res.status(500).send("Internal Server Error");
  }
}

/* ---------- 3. Disable Vercel's body parser so we can read raw body ---------- */
export const config = {
  api: { bodyParser: false },
};
