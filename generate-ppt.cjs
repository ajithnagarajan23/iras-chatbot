const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";

// ── Theme colours ──────────────────────────────────────────────────
const DARK_BLUE  = "1B3A6B";
const ACCENT     = "E8A020";
const WHITE      = "FFFFFF";
const LIGHT_GREY = "F4F6FA";
const MID_GREY   = "6B7280";
const TEXT_DARK  = "1F2937";

// ── Helper: add a standard slide with title bar ────────────────────
function addSlide(title) {
  const sl = pptx.addSlide();
  // background
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: LIGHT_GREY } });
  // top bar
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: DARK_BLUE } });
  // accent stripe
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 1.1, w: "100%", h: 0.08, fill: { color: ACCENT } });
  // title text
  sl.addText(title, {
    x: 0.4, y: 0.15, w: 12, h: 0.8,
    fontSize: 24, bold: true, color: WHITE, fontFace: "Calibri",
  });
  return sl;
}

// ── Helper: tech card ──────────────────────────────────────────────
function addCard(sl, x, y, w, h, icon, name, color, desc) {
  sl.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: WHITE }, line: { color: color, width: 2 }, shadow: { type: "outer", blur: 6, offset: 2, angle: 45, color: "CCCCCC", opacity: 0.4 } });
  sl.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.12, fill: { color } });
  sl.addText(icon + "  " + name, { x: x + 0.15, y: y + 0.18, w: w - 0.3, h: 0.45, fontSize: 15, bold: true, color: TEXT_DARK, fontFace: "Calibri" });
  sl.addText(desc, { x: x + 0.15, y: y + 0.65, w: w - 0.3, h: h - 0.8, fontSize: 11, color: MID_GREY, fontFace: "Calibri", valign: "top" });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ══════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: DARK_BLUE } });
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 3.6, w: "100%", h: 0.12, fill: { color: ACCENT } });

  sl.addText("IRAS WhatsApp Tax Chatbot", {
    x: 0.8, y: 1.0, w: 11.4, h: 1.2,
    fontSize: 40, bold: true, color: WHITE, fontFace: "Calibri", align: "center",
  });
  sl.addText("Proof of Concept (POC)", {
    x: 0.8, y: 2.3, w: 11.4, h: 0.6,
    fontSize: 22, color: ACCENT, fontFace: "Calibri", align: "center",
  });
  sl.addText("AI-powered chatbot that answers Singapore taxpayer queries\nusing live IRAS website content", {
    x: 0.8, y: 3.0, w: 11.4, h: 0.8,
    fontSize: 14, color: "B0C4E8", fontFace: "Calibri", align: "center",
  });
  sl.addText("May 2026", {
    x: 0.8, y: 4.5, w: 11.4, h: 0.4,
    fontSize: 13, color: MID_GREY, fontFace: "Calibri", align: "center",
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 2 — Problem Statement
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("The Problem");
  const items = [
    ["😓", "Taxpayers struggle to find quick answers on the IRAS website"],
    ["📞", "IRAS hotline gets flooded with repetitive, simple questions"],
    ["🔍", "Website has hundreds of pages — hard to navigate"],
    ["⏱️", "People want instant answers, not long searches"],
  ];
  items.forEach(([icon, text], i) => {
    const y = 1.5 + i * 0.9;
    sl.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 12, h: 0.72, fill: { color: WHITE }, line: { color: "E5E7EB", width: 1 } });
    sl.addText(icon, { x: 0.7, y: y + 0.1, w: 0.6, h: 0.5, fontSize: 20 });
    sl.addText(text, { x: 1.4, y: y + 0.12, w: 10.8, h: 0.5, fontSize: 16, color: TEXT_DARK, fontFace: "Calibri", valign: "middle" });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 3 — Our Solution
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("Our Solution");
  sl.addText("A WhatsApp chatbot that reads IRAS documents and answers tax questions — instantly.", {
    x: 0.5, y: 1.3, w: 12, h: 0.6,
    fontSize: 18, color: TEXT_DARK, fontFace: "Calibri", bold: true,
  });

  const steps = [
    { n: "1", label: "Scrape", desc: "Automatically reads all IRAS web pages", color: "3B82F6" },
    { n: "2", label: "Index",  desc: "Converts content into searchable AI vectors", color: "8B5CF6" },
    { n: "3", label: "Ask",    desc: "User sends a WhatsApp message", color: "10B981" },
    { n: "4", label: "Find",   desc: "AI finds the most relevant IRAS content", color: "F59E0B" },
    { n: "5", label: "Answer", desc: "Claude AI generates a clear answer", color: "EF4444" },
  ];

  // arrow connector boxes
  steps.forEach((s, i) => {
    const x = 0.3 + i * 2.45;
    sl.addShape(pptx.ShapeType.rect, { x, y: 2.1, w: 2.2, h: 1.6, fill: { color: s.color }, shadow: { type: "outer", blur: 5, offset: 2, angle: 45, color: "BBBBBB", opacity: 0.4 } });
    sl.addText(s.n, { x, y: 2.15, w: 2.2, h: 0.5, fontSize: 22, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
    sl.addText(s.label, { x, y: 2.65, w: 2.2, h: 0.4, fontSize: 14, bold: true, color: WHITE, fontFace: "Calibri", align: "center" });
    sl.addText(s.desc, { x, y: 3.05, w: 2.2, h: 0.6, fontSize: 10, color: WHITE, fontFace: "Calibri", align: "center", valign: "top" });
    if (i < 4) {
      sl.addText("→", { x: x + 2.2, y: 2.6, w: 0.25, h: 0.5, fontSize: 20, bold: true, color: MID_GREY, fontFace: "Calibri" });
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 4 — Technology Stack Overview
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("Technology Stack — 5 Tools, 1 Bot");

  const techs = [
    { icon: "🔥", name: "Firecrawl",  color: "EF4444", role: "Web Scraper",      desc: "Reads all IRAS web pages automatically" },
    { icon: "🚀", name: "Voyage AI",  color: "8B5CF6", role: "AI Search Engine", desc: "Converts text into searchable numbers (vectors)" },
    { icon: "🧠", name: "Claude AI",  color: "3B82F6", role: "The Brain",         desc: "Generates human-like answers using Anthropic API" },
    { icon: "💬", name: "Twilio",     color: "F59E0B", role: "WhatsApp Gateway", desc: "Sends and receives WhatsApp messages" },
    { icon: "☁️", name: "Railway",    color: "10B981", role: "Cloud Hosting",    desc: "Keeps the chatbot running 24/7 in the cloud" },
  ];

  techs.forEach((t, i) => {
    const x = 0.3 + (i % 3) * 4.15;
    const y = i < 3 ? 1.5 : 3.1;
    const w = 3.9;
    const h = 1.3;
    sl.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: WHITE }, line: { color: t.color, width: 2 } });
    sl.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.1, fill: { color: t.color } });
    sl.addText(t.icon + "  " + t.name, { x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.4, fontSize: 15, bold: true, color: TEXT_DARK, fontFace: "Calibri" });
    sl.addText(t.role, { x: x + 0.15, y: y + 0.52, w: w - 0.3, h: 0.28, fontSize: 11, bold: true, color: t.color, fontFace: "Calibri" });
    sl.addText(t.desc, { x: x + 0.15, y: y + 0.78, w: w - 0.3, h: 0.4, fontSize: 11, color: MID_GREY, fontFace: "Calibri" });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 5 — Firecrawl
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("🔥  Firecrawl — Web Scraper");
  sl.addText("What it does:", { x: 0.5, y: 1.3, w: 12, h: 0.4, fontSize: 16, bold: true, color: "EF4444", fontFace: "Calibri" });
  sl.addText("Automatically visits every page on the IRAS website and extracts clean, readable text — even pages that require JavaScript to load.", {
    x: 0.5, y: 1.7, w: 12, h: 0.7, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri",
  });

  const points = [
    "Crawls 100+ IRAS web pages automatically",
    "Extracts clean text (removes menus, ads, footers)",
    "Handles JavaScript-rendered pages that normal scrapers miss",
    "Saves content as structured files for AI processing",
  ];
  points.forEach((p, i) => {
    sl.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.55 + i * 0.65, w: 0.35, h: 0.35, fill: { color: "EF4444" } });
    sl.addText(p, { x: 1.0, y: 2.55 + i * 0.65, w: 11.5, h: 0.4, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri", valign: "middle" });
  });

  sl.addShape(pptx.ShapeType.rect, { x: 9.0, y: 1.3, w: 3.8, h: 3.2, fill: { color: "FEF2F2" }, line: { color: "EF4444", width: 1 } });
  sl.addText("Without Firecrawl\nvs\nWith Firecrawl", { x: 9.0, y: 1.4, w: 3.8, h: 0.7, fontSize: 12, bold: true, color: "EF4444", fontFace: "Calibri", align: "center" });
  sl.addText("❌  Manual copy-paste\n❌  Misses JS content\n❌  Hours of work\n\n✅  Fully automated\n✅  Complete content\n✅  Done in minutes", {
    x: 9.1, y: 2.1, w: 3.6, h: 2.2, fontSize: 12, color: TEXT_DARK, fontFace: "Calibri",
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 6 — Voyage AI
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("🚀  Voyage AI — Smart Search Engine");
  sl.addText("What it does:", { x: 0.5, y: 1.3, w: 12, h: 0.4, fontSize: 16, bold: true, color: "8B5CF6", fontFace: "Calibri" });
  sl.addText("Converts text into numbers (called vectors/embeddings) that capture meaning — so the chatbot can find the most relevant IRAS content for any question.", {
    x: 0.5, y: 1.7, w: 12, h: 0.7, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri",
  });

  sl.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.5, w: 3.5, h: 1.8, fill: { color: "EDE9FE" }, line: { color: "8B5CF6", width: 1 } });
  sl.addText("User asks:\n\"How do I register for GST?\"", { x: 0.6, y: 2.6, w: 3.3, h: 1.5, fontSize: 13, color: TEXT_DARK, fontFace: "Calibri", valign: "middle", align: "center" });

  sl.addText("→", { x: 4.1, y: 3.2, w: 0.6, h: 0.5, fontSize: 22, bold: true, color: "8B5CF6" });

  sl.addShape(pptx.ShapeType.rect, { x: 4.8, y: 2.5, w: 3.5, h: 1.8, fill: { color: "EDE9FE" }, line: { color: "8B5CF6", width: 1 } });
  sl.addText("Voyage AI converts\nboth question + documents\ninto numbers", { x: 4.9, y: 2.6, w: 3.3, h: 1.5, fontSize: 13, color: TEXT_DARK, fontFace: "Calibri", valign: "middle", align: "center" });

  sl.addText("→", { x: 8.4, y: 3.2, w: 0.6, h: 0.5, fontSize: 22, bold: true, color: "8B5CF6" });

  sl.addShape(pptx.ShapeType.rect, { x: 9.1, y: 2.5, w: 3.5, h: 1.8, fill: { color: "EDE9FE" }, line: { color: "8B5CF6", width: 1 } });
  sl.addText("Finds the top 5 most\nrelevant IRAS pages\nbased on meaning", { x: 9.2, y: 2.6, w: 3.3, h: 1.5, fontSize: 13, color: TEXT_DARK, fontFace: "Calibri", valign: "middle", align: "center" });

  sl.addText("✨  Uses finance-tuned model (voyage-finance-2) — specially trained on tax & financial documents", {
    x: 0.5, y: 4.5, w: 12, h: 0.4, fontSize: 13, color: "8B5CF6", fontFace: "Calibri", italic: true,
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 7 — Claude AI
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("🧠  Claude AI (Anthropic) — The Brain");
  sl.addText("What it does:", { x: 0.5, y: 1.3, w: 12, h: 0.4, fontSize: 16, bold: true, color: "3B82F6", fontFace: "Calibri" });
  sl.addText("Takes the relevant IRAS content found by Voyage AI and crafts a clear, accurate, human-friendly answer — just like a knowledgeable tax advisor.", {
    x: 0.5, y: 1.7, w: 12, h: 0.7, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri",
  });

  const points = [
    ["Model used", "claude-sonnet-4-6 — Anthropic's latest, fast and accurate"],
    ["Context-aware", "Remembers the last 3 messages in the conversation"],
    ["Grounded answers", "Only answers based on actual IRAS documents — no hallucination"],
    ["Concise replies", "Keeps answers short and suitable for WhatsApp (≤1500 chars)"],
  ];
  points.forEach(([label, desc], i) => {
    const y = 2.55 + i * 0.68;
    sl.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 12.5, h: 0.55, fill: { color: i % 2 === 0 ? "EFF6FF" : WHITE }, line: { color: "DBEAFE", width: 1 } });
    sl.addText(label, { x: 0.65, y: y + 0.08, w: 2.8, h: 0.4, fontSize: 13, bold: true, color: "3B82F6", fontFace: "Calibri" });
    sl.addText(desc, { x: 3.5, y: y + 0.08, w: 9.3, h: 0.4, fontSize: 13, color: TEXT_DARK, fontFace: "Calibri" });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 8 — Twilio
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("💬  Twilio — WhatsApp Gateway");
  sl.addText("What it does:", { x: 0.5, y: 1.3, w: 12, h: 0.4, fontSize: 16, bold: true, color: "F59E0B", fontFace: "Calibri" });
  sl.addText("Connects our chatbot to WhatsApp. When a user sends a message, Twilio receives it and forwards it to our app — and sends the reply back.", {
    x: 0.5, y: 1.7, w: 12, h: 0.7, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri",
  });

  // flow diagram
  const boxes = [
    { label: "User sends\nWhatsApp message", x: 0.4 },
    { label: "Twilio receives\n& forwards to app", x: 3.2 },
    { label: "App processes\n& generates answer", x: 6.0 },
    { label: "Twilio sends\nreply to user", x: 8.8 },
  ];
  boxes.forEach((b, i) => {
    sl.addShape(pptx.ShapeType.rect, { x: b.x, y: 2.6, w: 2.6, h: 1.3, fill: { color: i === 1 || i === 3 ? "FEF3C7" : WHITE }, line: { color: "F59E0B", width: 2 } });
    sl.addText(b.label, { x: b.x, y: 2.6, w: 2.6, h: 1.3, fontSize: 13, color: TEXT_DARK, fontFace: "Calibri", align: "center", valign: "middle" });
    if (i < 3) sl.addText("→", { x: b.x + 2.6, y: 3.05, w: 0.4, h: 0.5, fontSize: 20, bold: true, color: "F59E0B" });
  });

  sl.addText("📱  WhatsApp Number for POC:  +1 415 523 8886  (Twilio Sandbox)", {
    x: 0.5, y: 4.2, w: 12, h: 0.4, fontSize: 13, color: "92400E", fontFace: "Calibri",
    fill: { color: "FEF9C3" }, align: "center",
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 9 — Railway
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("☁️  Railway — Cloud Hosting");
  sl.addText("What it does:", { x: 0.5, y: 1.3, w: 12, h: 0.4, fontSize: 16, bold: true, color: "10B981", fontFace: "Calibri" });
  sl.addText("Hosts our chatbot in the cloud so it's accessible 24/7 — no laptop needs to stay on.", {
    x: 0.5, y: 1.7, w: 12, h: 0.5, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri",
  });

  const points = [
    "✅  Always online — no need to keep your laptop running",
    "✅  Auto-deploys when we update the code",
    "✅  Provides a public URL that Twilio can reach",
    "✅  Free tier covers POC usage (~$5/month credit)",
  ];
  points.forEach((p, i) => {
    sl.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.4 + i * 0.65, w: 7.5, h: 0.52, fill: { color: "ECFDF5" }, line: { color: "10B981", width: 1 } });
    sl.addText(p, { x: 0.7, y: 2.45 + i * 0.65, w: 7.2, h: 0.42, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri", valign: "middle" });
  });

  sl.addShape(pptx.ShapeType.rect, { x: 8.8, y: 2.2, w: 4.0, h: 2.4, fill: { color: "ECFDF5" }, line: { color: "10B981", width: 2 } });
  sl.addText("Live URL", { x: 8.8, y: 2.25, w: 4.0, h: 0.4, fontSize: 13, bold: true, color: "10B981", fontFace: "Calibri", align: "center" });
  sl.addText("grand-tenderness-\nproduction-39f7.\nup.railway.app", { x: 8.9, y: 2.7, w: 3.8, h: 1.7, fontSize: 12, color: TEXT_DARK, fontFace: "Courier New", align: "center", valign: "middle" });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 10 — Full Architecture Flow
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("How It All Works Together");

  // One-time setup row
  sl.addText("ONE-TIME SETUP", { x: 0.3, y: 1.3, w: 2.4, h: 0.4, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", fill: { color: MID_GREY }, align: "center" });
  const setupBoxes = [
    { label: "🔥 Firecrawl\nscrapes IRAS\nwebsite", color: "EF4444" },
    { label: "✂️ Text split\ninto chunks", color: "6B7280" },
    { label: "🚀 Voyage AI\ncreates vectors\n(embeddings)", color: "8B5CF6" },
    { label: "💾 Saved to\nvectors.json\n(163 chunks)", color: "6B7280" },
  ];
  setupBoxes.forEach((b, i) => {
    sl.addShape(pptx.ShapeType.rect, { x: 0.3 + i * 3.15, y: 1.75, w: 2.8, h: 1.1, fill: { color: WHITE }, line: { color: b.color, width: 2 } });
    sl.addText(b.label, { x: 0.3 + i * 3.15, y: 1.75, w: 2.8, h: 1.1, fontSize: 12, color: TEXT_DARK, fontFace: "Calibri", align: "center", valign: "middle" });
    if (i < 3) sl.addText("→", { x: 0.3 + i * 3.15 + 2.8, y: 2.15, w: 0.3, h: 0.4, fontSize: 18, bold: true, color: MID_GREY });
  });

  // Live chat row
  sl.addText("LIVE CHAT", { x: 0.3, y: 3.05, w: 2.4, h: 0.4, fontSize: 11, bold: true, color: WHITE, fontFace: "Calibri", fill: { color: DARK_BLUE }, align: "center" });
  const liveBoxes = [
    { label: "💬 User sends\nWhatsApp\nmessage", color: "F59E0B" },
    { label: "🚀 Voyage AI\nembeds the\nquestion", color: "8B5CF6" },
    { label: "🔍 Top 5 relevant\nIRAS chunks\nretrieved", color: "3B82F6" },
    { label: "🧠 Claude AI\ngenerates\nanswer", color: "3B82F6" },
    // { label: "✅ Reply sent\nback on\nWhatsApp", color: "10B981" },
  ];
  liveBoxes.forEach((b, i) => {
    sl.addShape(pptx.ShapeType.rect, { x: 0.3 + i * 3.15, y: 3.5, w: 2.8, h: 1.1, fill: { color: WHITE }, line: { color: b.color, width: 2 } });
    sl.addText(b.label, { x: 0.3 + i * 3.15, y: 3.5, w: 2.8, h: 1.1, fontSize: 12, color: TEXT_DARK, fontFace: "Calibri", align: "center", valign: "middle" });
    if (i < 3) sl.addText("→", { x: 0.3 + i * 3.15 + 2.8, y: 3.9, w: 0.3, h: 0.4, fontSize: 18, bold: true, color: DARK_BLUE });
  });
  // last arrow + reply box
  sl.addText("→", { x: 12.75, y: 3.9, w: 0.3, h: 0.4, fontSize: 18, bold: true, color: DARK_BLUE });
  sl.addShape(pptx.ShapeType.rect, { x: 0.3 + 4 * 3.15, y: 3.5, w: 2.8, h: 1.1, fill: { color: "ECFDF5" }, line: { color: "10B981", width: 2 } });
  sl.addText("✅ Reply sent\nback on\nWhatsApp", { x: 0.3 + 4 * 3.15, y: 3.5, w: 2.8, h: 1.1, fontSize: 12, color: TEXT_DARK, fontFace: "Calibri", align: "center", valign: "middle" });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 11 — Summary
// ══════════════════════════════════════════════════════════════════
{
  const sl = addSlide("Summary — What We Built");

  const rows = [
    ["🔥", "Firecrawl",  "EF4444", "Scraped 100+ IRAS pages automatically"],
    ["🚀", "Voyage AI",  "8B5CF6", "Created 163 searchable AI vectors from IRAS content"],
    ["🧠", "Claude AI",  "3B82F6", "Generates accurate, grounded answers via claude-sonnet-4-6"],
    ["💬", "Twilio",     "F59E0B", "Connects chatbot to WhatsApp sandbox"],
    ["☁️", "Railway",    "10B981", "Hosts the bot 24/7 with a public URL"],
  ];

  rows.forEach(([icon, name, color, desc], i) => {
    const y = 1.45 + i * 0.72;
    sl.addShape(pptx.ShapeType.rect, { x: 0.4, y, w: 12.2, h: 0.62, fill: { color: i % 2 === 0 ? WHITE : LIGHT_GREY }, line: { color: "E5E7EB", width: 1 } });
    sl.addShape(pptx.ShapeType.rect, { x: 0.4, y, w: 0.1, h: 0.62, fill: { color } });
    sl.addText(icon + "  " + name, { x: 0.6, y: y + 0.1, w: 2.2, h: 0.42, fontSize: 14, bold: true, color, fontFace: "Calibri" });
    sl.addText(desc, { x: 2.9, y: y + 0.1, w: 9.5, h: 0.42, fontSize: 14, color: TEXT_DARK, fontFace: "Calibri", valign: "middle" });
  });

  sl.addShape(pptx.ShapeType.rect, { x: 0.4, y: 5.15, w: 12.2, h: 0.5, fill: { color: DARK_BLUE } });
  sl.addText("POC Status: ✅ Live at  grand-tenderness-production-39f7.up.railway.app", {
    x: 0.4, y: 5.15, w: 12.2, h: 0.5, fontSize: 14, bold: true, color: WHITE, fontFace: "Calibri", align: "center", valign: "middle",
  });
}

// ── Save ──────────────────────────────────────────────────────────
pptx.writeFile({ fileName: "d:\\AI-IRAS-ChatBot\\IRAS-Chatbot-POC.pptx" })
  .then(() => console.log("✅  Saved: d:\\AI-IRAS-ChatBot\\IRAS-Chatbot-POC.pptx"))
  .catch((e) => console.error("❌  Error:", e));