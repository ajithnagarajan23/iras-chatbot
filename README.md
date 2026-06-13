# IRAS WhatsApp Tax Chatbot — POC

An AI-powered WhatsApp chatbot that answers Singapore taxpayer queries by referencing official IRAS (Inland Revenue Authority of Singapore) website content.

---

## What It Does

- Taxpayers send a question on WhatsApp
- The bot finds the most relevant IRAS content using AI search
- Claude AI generates a clear, concise answer with a source link
- The bot remembers the last 10 messages for follow-up questions

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Firecrawl** | Scrapes IRAS website pages into clean text |
| **Voyage AI** | Converts text into searchable vectors (embeddings) |
| **Claude AI** | Generates answers using retrieved IRAS content |
| **Twilio** | WhatsApp messaging gateway |
| **Railway** | Cloud hosting (24/7 deployment) |
| **Express.js** | HTTP server and webhook handler |

---

## Project Structure

```
iras-chatbot/
├── api/
│   ├── main.js          # Express server, routes
│   ├── webhook.js       # Twilio WhatsApp handler
│   └── session.js       # In-memory conversation history
├── rag/
│   ├── retriever.js     # Voyage AI search (cosine similarity)
│   ├── generator.js     # Claude AI answer generation
│   └── prompts.js       # System prompt and message builder
├── ingest/
│   ├── scrape.js        # Firecrawl web scraper
│   └── index.js         # Voyage AI embedding generator
├── data/
│   ├── raw/             # Scraped IRAS pages (markdown)
│   └── vectors.json     # AI embeddings (used at runtime)
├── Dockerfile
├── .env                 # API keys (never commit this)
└── package.json
```

---

## Prerequisites

- Node.js 20+
- API keys for: Anthropic, Voyage AI, Firecrawl, Twilio
- A Railway account for deployment

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

```env
# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your_key_here

# Voyage AI (Embeddings)
VOYAGE_API_KEY=your_key_here
VOYAGE_MODEL=voyage-finance-2

# Firecrawl (Web Scraping)
FIRECRAWL_API_KEY=your_key_here

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# App Config
CLAUDE_MODEL=claude-sonnet-4-6
TOP_K_RESULTS=5
SESSION_TIMEOUT_MINUTES=30
RAW_DATA_PATH=./data/raw
```

---

## Running the Pipeline

### Step 1 — Scrape IRAS website

Crawls all configured IRAS sections and saves clean text to `data/raw/`.

```bash
npm run scrape
```

> Takes ~5–10 minutes. Scrapes 9 IRAS sections (GST, Income Tax, Corporate Tax, Property Tax, Stamp Duty, Withholding Tax, Digital Services, Tax Rates, Who We Are).

---

### Step 2 — Generate embeddings

Converts scraped text into AI vectors and saves to `data/vectors.json`.

```bash
npm run index
```

> Takes ~1–2 hours on Voyage AI free tier (3 requests/min limit). Only needs to be run once, or when IRAS content is updated.

---

### Step 3 — Start the server

```bash
npm start
```

Server runs on `http://localhost:3000`

| Endpoint | Description |
|---|---|
| `GET /` | Web chat interface |
| `GET /health` | Health check |
| `POST /ask` | REST API for questions |
| `POST /webhook` | Twilio WhatsApp webhook |
| `DELETE /session/:user_id` | Clear conversation history |

---

## WhatsApp Setup (Twilio Sandbox)

1. Go to [twilio.com/console](https://www.twilio.com/console)
2. Navigate to **Messaging → Try it out → Send a WhatsApp message**
3. Join the sandbox: send `join <sandbox-keyword>` to `+1 415 523 8886`
4. Set the webhook URL to: `https://your-deployment-url/webhook`

---

## Deployment (Railway)

### First-time deploy

```bash
npm install -g @railway/cli
railway login
railway init
railway up --service "your-service-name"
```

### Re-deploy after code changes

```bash
railway up --detach --service "your-service-name"
```

### Environment variables on Railway

Set all `.env` variables in Railway dashboard under:
**Project → Service → Variables**

> The `.env` file is deleted during Docker build for security. All keys must be set as Railway environment variables.

---

## How It Works

```
ONE-TIME SETUP
──────────────
Firecrawl → scrapes IRAS pages → data/raw/*.md
Voyage AI → converts text to vectors → data/vectors.json

LIVE CHAT (every message)
─────────────────────────
User (WhatsApp)
  → Twilio → POST /webhook
  → Voyage AI embeds the question
  → Cosine similarity search on vectors.json
  → Top 5 matching IRAS chunks retrieved
  → Claude AI reads chunks + conversation history
  → Generates answer with source URL
  → Twilio delivers reply to WhatsApp
```

---

## Sample Questions to Test

- How do I register for GST?
- What is the corporate tax rate in Singapore?
- I am a freelancer, how do I pay tax?
- What is the difference between FIN and NRIC?
- What is the deadline for income tax filing?
- How is property tax calculated?
- What is Additional Buyer's Stamp Duty (ABSD)?
- What is withholding tax and when does it apply?

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `TOP_K_RESULTS` | `5` | Number of IRAS chunks sent to Claude |
| `SESSION_TIMEOUT_MINUTES` | `30` | Conversation session expiry |
| `VOYAGE_MODEL` | `voyage-finance-2` | Voyage AI model (finance-tuned) |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude model version |

---

## Limitations (POC)

- Conversation history is stored **in memory** — lost on server restart
- `data/vectors.json` must be re-generated if IRAS content changes
- Voyage AI free tier: 3 requests/minute (slow initial response, cached on repeat)
- Twilio sandbox: requires users to join before chatting

---

## Live Deployment

- **URL:** https://grand-tenderness-production-39f7.up.railway.app
- **WhatsApp:** +1 415 523 8886 (Twilio Sandbox)