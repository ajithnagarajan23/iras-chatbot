import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env") });

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL   = process.env.VOYAGE_MODEL || "voyage-finance-2";
const VECTORS_PATH   = path.resolve(__dirname, "../data/vectors.json");
const TOP_K          = parseInt(process.env.TOP_K_RESULTS || "3");

// Load vector store once at startup
let _vectors = null;
function loadVectors() {
  if (!_vectors) {
    if (!fs.existsSync(VECTORS_PATH)) {
      throw new Error(`Vector store not found at ${VECTORS_PATH}. Run ingest/index.js first.`);
    }
    _vectors = JSON.parse(fs.readFileSync(VECTORS_PATH, "utf-8"));
  }
  return _vectors;
}

// Query embedding cache — avoids Voyage AI API call for repeated/similar questions
const _embedCache = new Map();
const MAX_CACHE   = 200;

function normalise(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function getCached(text) {
  return _embedCache.get(normalise(text));
}

function setCache(text, embedding) {
  if (_embedCache.size >= MAX_CACHE) {
    // evict oldest entry
    _embedCache.delete(_embedCache.keys().next().value);
  }
  _embedCache.set(normalise(text), embedding);
}


function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedQuery(text, attempt = 1) {
  // return cached embedding if available — no API call needed
  const cached = getCached(text);
  if (cached) {
    console.log(`  [cache hit] skipped Voyage AI call`);
    return cached;
  }

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL }),
  });

  if (res.status === 429) {
    if (attempt > 3) throw new Error("Voyage AI rate limit exceeded after 3 retries");
    const wait = 8 * attempt;
    console.log(`  [Voyage AI 429] waiting ${wait}s (retry ${attempt}/3)...`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return embedQuery(text, attempt + 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage AI embed error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const embedding = json.data[0].embedding;

  // cache for future identical queries
  setCache(text, embedding);
  return embedding;
}

export async function retrieve(query, topK = TOP_K) {
  const vectors     = loadVectors();
  const queryVector = await embedQuery(query);

  const scored = vectors.map((v) => ({
    id:           v.id,
    source_url:   v.source_url,
    title:        v.title,
    tax_category: v.tax_category,
    text:         v.text,
    score:        cosineSimilarity(queryVector, v.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ embedding: _e, ...rest }) => rest); // strip embedding from result
}
