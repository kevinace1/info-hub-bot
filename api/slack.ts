// api/slack.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  // This simple function just proves the URL is working.
  res.status(200).send('👍 Alive');
}

// Tell Vercel to use its fast Edge runtime
export const config = { runtime: 'edge' };
