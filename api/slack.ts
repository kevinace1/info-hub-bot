
// api/slack.ts
// This is a Vercel Edge Function (no Node types or Express-style res objects).

export default (request: Request) => {
  // Always return plain text with a 200 status.
  return new Response("👍 Alive", { status: 200 });
};

// Tell Vercel: run this as an Edge Function (not a Node server).
export const config = { runtime: "edge" };
