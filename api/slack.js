// api/slack.js
const { App, LogLevel, ExpressReceiver } = require("@slack/bolt");

/* 0 ─────────────  Express Receiver for Vercel  ───────────── */
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});

/* 1 ─────────────  Bolt instance  ───────────── */
const bolt = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  logLevel: LogLevel.DEBUG,
});

/* 2 ─────────────  Simple ping-pong  ─────────── */
bolt.message(/ping/i, async ({ message, say }) => {
  console.log("Ping message received:", message.text);
  await say({ thread_ts: message.ts, text: "pong — bot online ✅" });
});

/* 3 ─────────────  App mention ping-pong  ─────────── */
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

/* 4 ─────────────  Vercel handler  ───────────── */
module.exports = receiver.app;

/* 5 ─────────────  Disable body-parser  ───────── */
module.exports.config = { api: { bodyParser: false } };
