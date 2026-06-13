import FirecrawlApp from "@mendable/firecrawl-js";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { config } from "dotenv";

config({ path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../.env") });

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const RAW_DATA_PATH = path.resolve(process.env.RAW_DATA_PATH || "./data/raw");
const CRAWL_URLS = [
  "https://www.iras.gov.sg/taxes/goods-services-tax-(gst)",
  "https://www.iras.gov.sg/taxes/individual-income-tax",
  "https://www.iras.gov.sg/taxes/corporate-income-tax",
  "https://www.iras.gov.sg/taxes/property-tax",
  "https://www.iras.gov.sg/taxes/stamp-duty",
  "https://www.iras.gov.sg/taxes/withholding-tax",
  "https://www.iras.gov.sg/digital-services",
  "https://www.iras.gov.sg/who-we-are",
  "https://www.iras.gov.sg/quick-links/tax-rates",
];

fs.mkdirSync(RAW_DATA_PATH, { recursive: true });

function slugify(pageUrl) {
  return pageUrl
    .replace(/https?:\/\/[^/]+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 100) || "index";
}

function savePage(page, index) {
  const pageUrl = page.metadata?.sourceURL || page.metadata?.url || page.url || "";
  const markdown = (page.markdown || "").trim();
  const title = (page.metadata?.title || "").trim();

  if (!markdown) {
    console.log(`  [skip] No content: ${pageUrl}`);
    return null;
  }

  const slug = slugify(pageUrl);
  const filename = `${String(index).padStart(4, "0")}_${slug}.md`;
  const filepath = path.join(RAW_DATA_PATH, filename);

  const content = `<!-- source_url: ${pageUrl} -->\n<!-- title: ${title} -->\n\n${markdown}`;
  fs.writeFileSync(filepath, content, "utf-8");

  return { index, url: pageUrl, title, file: filename, chars: markdown.length };
}

async function main() {
  console.log(`Crawling ${CRAWL_URLS.length} IRAS sections...`);
  console.log(`Output folder: ${RAW_DATA_PATH}\n`);

  const app = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  const manifest = [];
  let globalIndex = 1;
  const seenUrls = new Set();

  for (const startUrl of CRAWL_URLS) {
    console.log(`\n── Crawling: ${startUrl}`);

    const crawlResult = await app.crawlUrl(startUrl, {
      limit: 40,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    });

    if (!crawlResult.success) {
      console.warn(`  Skipped (error): ${crawlResult.error}`);
      continue;
    }

    const pages = crawlResult.data || [];
    console.log(`  Pages returned: ${pages.length}`);

    for (const page of pages) {
      const pageUrl = page.metadata?.sourceURL || page.metadata?.url || page.url || "";
      if (seenUrls.has(pageUrl)) continue; // skip duplicates across sections
      seenUrls.add(pageUrl);

      const entry = savePage(page, globalIndex);
      if (entry) {
        manifest.push(entry);
        console.log(`  [${String(globalIndex).padStart(3, "0")}] ${String(entry.chars).padStart(6)} chars  ${entry.url}`);
        globalIndex++;
      }
    }
  }

  const manifestPath = path.join(RAW_DATA_PATH, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`\nDone. ${manifest.length} pages saved to ${RAW_DATA_PATH}`);
  console.log(`Manifest written to ${manifestPath}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
