import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_FILE = path.resolve(__dirname, "../data/sessions.json");

const MAX_TURNS  = parseInt(process.env.HISTORY_MAX_TURNS || "25");
const TIMEOUT_MS = (parseInt(process.env.SESSION_TIMEOUT_MINUTES || "30")) * 60 * 1000;

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
      return new Map(Object.entries(JSON.parse(raw)));
    }
  } catch {
    // corrupt or missing — start fresh
  }
  return new Map();
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(Object.fromEntries(sessions)), "utf-8");
  } catch {
    // non-fatal — in-memory still works
  }
}

const sessions = loadSessions();

export function getHistory(userId) {
  const session = sessions.get(userId);
  if (!session) return [];

  if (Date.now() - session.lastActive > TIMEOUT_MS) {
    sessions.delete(userId);
    saveSessions();
    return [];
  }

  return session.history;
}

export function addTurn(userId, userMessage, assistantMessage) {
  const history = getHistory(userId);

  history.push({ role: "user",      content: userMessage });
  history.push({ role: "assistant", content: assistantMessage });

  const trimmed = history.slice(-(MAX_TURNS * 2));
  sessions.set(userId, { history: trimmed, lastActive: Date.now() });
  saveSessions();
}

export function clearSession(userId) {
  sessions.delete(userId);
  saveSessions();
}
