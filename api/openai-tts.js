// Secure server-side Text-to-Speech endpoint for "Say & It Becomes" — the
// paid-membership narration tier.
//
// The browser POSTs affirmation text here (only when the signed-in user is a
// paid member); this function calls OpenAI with the secret API key (read
// from the OPENAI_API_KEY environment variable, never sent to the client)
// and streams the generated MP3 audio back. Free members and guests never
// hit this endpoint — they get the browser's built-in speech synthesis.
//
// Runtime: a Node serverless function (Vercel `api/`, Netlify Functions, or the
// local Vite dev middleware in vite.config.js). It only uses standard Node
// request/response APIs so it behaves the same in every one of those hosts.

import OpenAI from "openai";

// "onyx" – a deep, calm preset voice, in the spirit of the app's tone.
const DEFAULT_VOICE = "onyx";
const DEFAULT_MODEL = "gpt-4o-mini-tts";
const MAX_TEXT_LENGTH = 5000;
const MAX_BODY_BYTES = 1_000_000;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[openai-tts] OPENAI_API_KEY is not set in the server environment");
    return sendJson(res, 503, { error: "Premium narration is not configured on the server." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: "Invalid or oversized JSON request body." });
  }

  const rawText = typeof body.text === "string" ? body.text : body.affirmation;
  const text = typeof rawText === "string" ? rawText.trim() : "";
  if (!text) {
    return sendJson(res, 400, { error: "Missing 'text' in request body." });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return sendJson(res, 413, {
      error: `Text is too long (${text.length} chars; max ${MAX_TEXT_LENGTH}).`,
    });
  }

  const voice = (typeof body.voice === "string" && body.voice.trim()) || DEFAULT_VOICE;
  const model = process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL;

  const client = new OpenAI({ apiKey });

  let audioBuffer;
  try {
    const response = await client.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: "mp3",
    });
    audioBuffer = Buffer.from(await response.arrayBuffer());
  } catch (err) {
    // Don't leak the API key or internal details to the client.
    const status = Number(err && err.status);
    const safeStatus = status >= 400 && status < 600 ? status : 502;
    console.error("[openai-tts] OpenAI request failed:", err && (err.message || err));
    return sendJson(res, safeStatus, { error: "Could not generate audio from OpenAI." });
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    return sendJson(res, 502, { error: "OpenAI returned no audio." });
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(audioBuffer.length));
  res.setHeader("Cache-Control", "no-store");
  res.end(audioBuffer);
}
