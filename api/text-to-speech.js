// Secure server-side Text-to-Speech endpoint for "Say & It Becomes".
//
// The browser POSTs affirmation text here; this function calls ElevenLabs with
// the secret API key (read from the ELEVENLABS_API_KEY environment variable,
// never sent to the client) and streams the generated MP3 audio back.
//
// Runtime: a Node serverless function (Vercel `api/`, Netlify Functions, or the
// local Vite dev middleware in vite.config.js). It only uses standard Node
// request/response APIs so it behaves the same in every one of those hosts.

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// "George" – a calm, warm preset voice. Override per-request or via env.
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
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

async function collectAudio(audio) {
  // client.textToSpeech.convert() resolves to a web ReadableStream, but be
  // tolerant of a Node Readable or a Buffer depending on runtime/SDK version.
  if (Buffer.isBuffer(audio)) return audio;
  if (audio && typeof audio.getReader === "function") {
    const reader = audio.getReader();
    const parts = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(Buffer.from(value));
    }
    return Buffer.concat(parts);
  }
  if (audio && typeof audio[Symbol.asyncIterator] === "function") {
    const parts = [];
    for await (const chunk of audio) parts.push(Buffer.from(chunk));
    return Buffer.concat(parts);
  }
  throw new Error("Unexpected audio payload from ElevenLabs SDK");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[text-to-speech] ELEVENLABS_API_KEY is not set in the server environment");
    return sendJson(res, 503, { error: "Text-to-speech is not configured on the server." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: "Invalid or oversized JSON request body." });
  }

  // Accept `text`; also accept `affirmation` as an alias for convenience.
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

  const voiceId =
    (typeof body.voiceId === "string" && body.voiceId.trim()) ||
    process.env.ELEVENLABS_VOICE_ID ||
    DEFAULT_VOICE_ID;
  const modelId =
    (typeof body.modelId === "string" && body.modelId.trim()) ||
    process.env.ELEVENLABS_MODEL_ID ||
    DEFAULT_MODEL_ID;

  const client = new ElevenLabsClient({ apiKey });

  let audioBuffer;
  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      outputFormat: OUTPUT_FORMAT,
    });
    audioBuffer = await collectAudio(audio);
  } catch (err) {
    // Don't leak the API key or internal details to the client.
    const status = Number(err && err.statusCode);
    const safeStatus = status >= 400 && status < 600 ? status : 502;
    console.error("[text-to-speech] ElevenLabs request failed:", err && (err.message || err));
    return sendJson(res, safeStatus, { error: "Could not generate audio from ElevenLabs." });
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    return sendJson(res, 502, { error: "ElevenLabs returned no audio." });
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(audioBuffer.length));
  res.setHeader("Cache-Control", "no-store");
  res.end(audioBuffer);
}
