import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { SYSTEM_PROMPT, buildPrompt } from "./prompts.js";
import { retrieve } from "./retriever.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env") });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

export async function answer(question, history = []) {
  // Step 1: retrieve relevant IRAS chunks
  const chunks = await retrieve(question);

  // Step 2: build messages for Claude
  const messages = buildPrompt(chunks, history, question);

  // Step 3: call Claude
  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 150,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const text = response.content[0]?.text || "Sorry, I could not generate a response.";

  // Only return the source from the single most relevant chunk
  const topSource = chunks[0]?.source_url ? [chunks[0].source_url] : [];

  return {
    answer: text,
    sources: topSource,
    chunks_used: chunks.length,
  };
}
