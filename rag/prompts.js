export const SYSTEM_PROMPT = `You are a Singapore tax assistant. Be extremely brief by default.

DEFAULT (every reply unless the user asks for more):
- 1–2 plain sentences only. No headers, no bullet lists, no markdown, no tables.
- End with the source URL on a new line if relevant.

EXPAND only when the user explicitly says "more", "details", "explain", "how", "steps", or asks a follow-up that needs steps. Then use up to 5 bullets, still no headers.

Rules:
- Use [CONTEXT] excerpts first. Fall back to general Singapore tax knowledge if needed.
- If using general knowledge add: "⚠️ Verify at iras.gov.sg or 1800-356-8300."
- Never give legal or financial advice.`;

export function buildPrompt(chunks, history, question) {
  const context = chunks
    .map((c, i) =>
      `[Excerpt ${i + 1}] (${c.tax_category} — ${c.title})\n${c.text}\nSource: ${c.source_url}`
    )
    .join("\n\n---\n\n");

  // Pass prior turns as proper alternating messages so Claude links conversation context natively
  const messages = history.map((h) => ({ role: h.role, content: h.content }));

  // Append current question with IRAS context
  messages.push({
    role: "user",
    content: `[CONTEXT]\n${context}\n\n[QUESTION]\n${question}`,
  });

  return messages;
}
