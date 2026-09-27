// Secure server-side affirmation generator for "Say & It Becomes".
//
// The browser POSTs the user's typed belief/worry/goal here; this function
// calls Claude with the secret API key (read from the ANTHROPIC_API_KEY
// environment variable, never sent to the client) and returns a personalized
// affirmation that responds to what the user actually wrote.
//
// Response shape matches the Anthropic Messages API on purpose
// ({ content: [{ type: "text", text }] }) because the client
// (requestAffirmation() in src/App.jsx) already parses that shape.
//
// Runtime: a Node serverless function (Vercel `api/`, Netlify Functions, or the
// local Vite dev middleware in vite.config.js). It only uses standard Node
// request/response APIs so it behaves the same in every one of those hosts.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";
const MAX_BELIEF_LENGTH = 2000;
const MAX_BODY_BYTES = 200_000;

const SYSTEM_PROMPT = `You write short, spoken-aloud daily affirmations for an app called "Say & It Becomes".

The user will describe a worry, doubt, or goal in their own words. Your job is to turn that specific input into a personal affirmation that clearly responds to what they said - it must be obvious, on a re-read, which parts of the affirmation come from their input. Never output a generic affirmation that could apply to anyone regardless of what they wrote.

The objective is to deliberately reinforce a positive, constructive belief by repeatedly focusing attention on a chosen thought tied to their situation - so the wording should feel like a reminder the person can return to, not a slogan.

Write one flowing paragraph (no headers, no lists, no markdown) that moves through, in order:
1. Identity: open with "Today, I am" naming 3-4 qualities that directly address what they described (e.g. if they named a job interview, use qualities like prepared, capable, calm under pressure - not generic ones).
2. Emotional state: how it feels in the body right now - calm, steady, grounded - in believable, unexaggerated language.
3. Mindset: reframe the specific worry or goal they named as something that grows through practice and experience, not something that requires being perfect first.
4. Behavior: describe, concretely, how they respond when the specific situation they described actually happens - not a generic challenge.
5. Action: name one small, concrete step tied to the specific goal or situation they described, to take today.
6. Future self: close with the identity they are becoming, tied to what they said, ending on "Today, I am."

Rules:
- First person, present tense ("I am"), never "I will be" or "I want to be".
- Calm and grounded tone. No exclamation points, no hype, no toxic positivity, and don't dismiss how hard the thing they described actually is.
- 120-180 words.
- Output ONLY the affirmation paragraph - no preamble, no quotation marks, no explanation.`;

function sendJson(res, status, payload) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  // Some hosts (Vercel) pre-parse the body.
  if (req.body != null) {
    if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};
    if (Buffer.isBuffer(req.body)) {
      const s = req.body.toString("utf8");
      return s ? JSON.parse(s) : {};
    }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[generate] ANTHROPIC_API_KEY is not set in the server environment");
    return sendJson(res, 503, { error: "Affirmation generation is not configured on the server." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: "Invalid or oversized JSON request body." });
  }

  const belief = typeof body.belief === "string" ? body.belief.trim() : "";
  if (!belief) {
    return sendJson(res, 400, { error: "Missing 'belief' in request body." });
  }
  if (belief.length > MAX_BELIEF_LENGTH) {
    return sendJson(res, 413, {
      error: `Input is too long (${belief.length} chars; max ${MAX_BELIEF_LENGTH}).`,
    });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: belief }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const text = textBlock?.text?.trim();
    if (!text) {
      return sendJson(res, 502, { error: "Claude returned no text." });
    }

    // Same shape requestAffirmation() already expects from this endpoint.
    return sendJson(res, 200, { content: [{ type: "text", text }] });
  } catch (err) {
    // The SDK's error message describes what Anthropic rejected about the
    // request (never the API key itself, which is sent as a header and never
    // echoed back) - safe to surface while we're diagnosing the 400 above.
    const status = Number(err && err.status);
    const safeStatus = status >= 400 && status < 600 ? status : 502;
    const detail = (err && (err.error?.error?.message || err.message)) || String(err);
    console.error("[generate] Claude request failed:", detail);
    return sendJson(res, safeStatus, { error: "Could not generate an affirmation.", detail });
  }
}
