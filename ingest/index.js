import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env") });

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL   = process.env.VOYAGE_MODEL || "voyage-finance-2";
const RAW_DATA_PATH  = path.resolve(__dirname, "../", process.env.RAW_DATA_PATH || "data/raw");
const VECTORS_PATH   = path.resolve(__dirname, "../data/vectors.json");

// ~500 tokens at ~4 chars/token
const CHUNK_CHARS    = 2000;
const CHUNK_OVERLAP  = 200;
const BATCH_SIZE     = 8;  // free tier: 3 RPM + 10K TPM → 8 chunks ≈ 4K tokens/req

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectTaxCategory(url) {
  if (!url) return "General";
  if (url.includes("/gst"))                    return "GST";
  if (url.includes("/stamp-duty"))             return "Stamp Duty";
  if (url.includes("/property"))               return "Property Tax";
  if (url.includes("/withholding-tax"))        return "Withholding Tax";
  if (url.includes("/companies") || url.includes("/corporate")) return "Corporate Tax";
  if (url.includes("/employees"))              return "Income Tax - Employees";
  if (url.includes("/self-employed"))          return "Income Tax - Self-Employed";
  if (url.includes("/employers"))              return "Income Tax - Employers";
  if (url.includes("/partnerships"))           return "Income Tax - Partnerships";
  if (url.includes("/automatic-exchange") || url.includes("/crs") || url.includes("/fatca")) return "CRS/FATCA";
  if (url.includes("/commission"))             return "Commission";
  if (url.includes("/intermediaries"))         return "Income Tax - Intermediaries";
  return "General";
}

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_CHARS, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start += CHUNK_CHARS - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 100);
}

function parseMarkdownFile(filepath) {
  const raw = fs.readFileSync(filepath, "utf-8");
  const urlMatch   = raw.match(/<!-- source_url:\s*(.*?)\s*-->/);
  const titleMatch = raw.match(/<!-- title:\s*([\s\S]*?)\s*-->/);
  const body = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
  return {
    url:   urlMatch?.[1]  || "",
    title: titleMatch?.[1]?.trim().replace(/\s+/g, " ") || "",
    body,
  };
}

async function embedBatch(texts, attempt = 1) {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
  });

  if (res.status === 429) {
    if (attempt > 5) throw new Error("Voyage AI rate limit exceeded after 5 retries");
    const wait = 65 * attempt;
    process.stdout.write(` [429 — waiting ${wait}s, retry ${attempt}/5...]`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    console.log("");
    return embedBatch(texts, attempt + 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage AI error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const manifestPath = path.join(RAW_DATA_PATH, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("manifest.json not found. Run ingest/scrape.js first.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`Loaded manifest: ${manifest.length} pages\n`);

  // ── Step 1: chunk all pages ──────────────────────────────────────────────
  const allChunks = [];
  for (const entry of manifest) {
    const filepath = path.join(RAW_DATA_PATH, entry.file);
    if (!fs.existsSync(filepath)) continue;

    const { url, title, body } = parseMarkdownFile(filepath);
    const chunks = chunkText(body);
    const category = detectTaxCategory(url || entry.url);

    chunks.forEach((text, i) => {
      allChunks.push({
        id:           `${entry.index}_chunk_${i}`,
        source_url:   url || entry.url,
        title:        title || entry.title,
        tax_category: category,
        chunk_index:  i,
        text,
      });
    });

    console.log(`  Chunked [${String(entry.index).padStart(2,"0")}] ${chunks.length} chunks  "${title || entry.title}"`);
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);
  console.log(`Embedding model: ${VOYAGE_MODEL}`);
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  // ── Step 2: embed in batches ─────────────────────────────────────────────
  const vectors = [];
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch     = allChunks.slice(i, i + BATCH_SIZE);
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

    process.stdout.write(`  Embedding batch ${batchNum}/${totalBatches} (chunks ${i + 1}–${Math.min(i + BATCH_SIZE, allChunks.length)})...`);

    const embeddings = await embedBatch(batch.map((c) => c.text));

    batch.forEach((chunk, j) => {
      vectors.push({ ...chunk, embedding: embeddings[j] });
    });

    console.log(" done");

    // free tier: 3 RPM + 10K TPM → 25s gap keeps us under both limits
    if (i + BATCH_SIZE < allChunks.length) {
      process.stdout.write(" (waiting 25s for rate limit...)");
      await new Promise((r) => setTimeout(r, 25000));
      console.log("");
    }
  }

  // ── Step 3: save vector store ────────────────────────────────────────────
  fs.mkdirSync(path.dirname(VECTORS_PATH), { recursive: true });
  fs.writeFileSync(VECTORS_PATH, JSON.stringify(vectors, null, 2), "utf-8");

  const dims = vectors[0]?.embedding?.length || 0;
  console.log(`\nVector store saved to: ${VECTORS_PATH}`);
  console.log(`Vectors: ${vectors.length}  |  Dimensions: ${dims}`);

  // ── Summary by category ──────────────────────────────────────────────────
  const byCat = {};
  vectors.forEach((v) => {
    byCat[v.tax_category] = (byCat[v.tax_category] || 0) + 1;
  });
  console.log("\nChunks by tax category:");
  Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${count.toString().padStart(3)} × ${cat}`));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
