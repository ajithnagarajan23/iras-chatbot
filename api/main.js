import express from "express";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { answer } from "../rag/generator.js";
import { getHistory, addTurn, clearSession } from "./session.js";
import { handleWhatsApp } from "./webhook.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env") });

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Landing page ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>IRAS Tax Chatbot</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; background: #f5f5f5; }
    h1 { color: #1a3c6e; }
    .badge { display: inline-block; background: #2ecc71; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
    .card { background: white; border-radius: 8px; padding: 20px 28px; margin: 16px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    code { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 14px; }
    textarea { width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; resize: vertical; box-sizing: border-box; }
    button { background: #1a3c6e; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 15px; cursor: pointer; margin-top: 10px; }
    button:hover { background: #2554a0; }
    #result { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
    .label { font-weight: bold; color: #555; margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>🇸🇬 IRAS Tax Chatbot</h1>
  <span class="badge">● Live</span>
  <div class="card">
    <div class="label">Ask a Singapore tax question</div>
    <textarea id="q" placeholder="e.g. How do I register for GST?"></textarea>
    <br/>
    <button onclick="ask()">Ask</button>
  </div>
  <div class="card" id="resultCard" style="display:none">
    <div class="label">Answer</div>
    <div id="result"></div>
    <div id="sources" style="margin-top:12px; font-size:13px; color:#888;"></div>
  </div>
  <div class="card" style="font-size:13px; color:#666;">
    <b>API Endpoints</b><br/>
    <code>POST /ask</code> — JSON body: <code>{"question":"...", "user_id":"..."}</code><br/>
    <code>POST /webhook</code> — Twilio WhatsApp webhook<br/>
    <code>GET /health</code> — Server status
  </div>
  <script>
    async function ask() {
      const q = document.getElementById('q').value.trim();
      if (!q) return;
      document.getElementById('result').innerText = 'Thinking...';
      document.getElementById('resultCard').style.display = 'block';
      document.getElementById('sources').innerText = '';
      try {
        const res = await fetch('/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, user_id: 'browser' })
        });
        const data = await res.json();
        document.getElementById('result').innerText = data.answer || data.error;
      } catch(e) {
        document.getElementById('result').innerText = 'Error: ' + e.message;
      }
    }
    document.getElementById('q').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) ask();
    });
  </script>
</body>
</html>`);
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", model: process.env.CLAUDE_MODEL });
});

// ── Direct Q&A endpoint (for testing without WhatsApp) ───────────────────────
app.post("/ask", async (req, res) => {
  const { question, user_id = "test-user" } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const history  = getHistory(user_id);
    const result   = await answer(question.trim(), history);
    addTurn(user_id, question.trim(), result.answer);

    res.json({
      answer:      result.answer,
      sources:     result.sources,
      chunks_used: result.chunks_used,
    });
  } catch (err) {
    console.error("Error in /ask:", err.message);
    res.status(500).json({ error: "Failed to generate answer. Please try again." });
  }
});

// ── Twilio WhatsApp webhook ───────────────────────────────────────────────────
app.post("/webhook", handleWhatsApp);

// ── Session reset ─────────────────────────────────────────────────────────────
app.delete("/session/:user_id", (req, res) => {
  clearSession(req.params.user_id);
  res.json({ status: "session cleared" });
});

app.listen(PORT, () => {
  console.log(`IRAS Chatbot API running on http://localhost:${PORT}`);
  console.log(`Test:     POST http://localhost:${PORT}/ask`);
  console.log(`Webhook:  POST http://localhost:${PORT}/webhook`);
  console.log(`Health:   GET  http://localhost:${PORT}/health`);
});

export default app;
