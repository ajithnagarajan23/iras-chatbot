import twilio from "twilio";
import { answer } from "../rag/generator.js";
import { getHistory, addTurn } from "./session.js";

const accountSid  = process.env.TWILIO_ACCOUNT_SID;
const authToken   = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

const MAX_WHATSAPP_CHARS = 1500;

function truncate(text) {
  if (text.length <= MAX_WHATSAPP_CHARS) return text;
  return text.slice(0, MAX_WHATSAPP_CHARS - 40) + "\n\n...reply 'more' for the full answer.";
}

async function sendWhatsApp(to, body) {
  const client = twilio(accountSid, authToken);
  await client.messages.create({ from: FROM_NUMBER, to, body });
}

export async function handleWhatsApp(req, res) {
  const from     = req.body.From || "";
  const body     = (req.body.Body || "").trim();
  const numMedia = parseInt(req.body.NumMedia || "0");

  // Respond to Twilio immediately — avoids 15-second webhook timeout that causes no-reply
  res.type("text/xml");
  res.send("<Response></Response>");

  if (numMedia > 0) {
    return sendWhatsApp(from, "I can only answer text questions about Singapore tax. Please type your question.").catch(() => {});
  }

  if (!body) {
    return sendWhatsApp(from, "Please type your Singapore tax question and I'll do my best to help.").catch(() => {});
  }

  if (body.toLowerCase() === "reset") {
    const { clearSession } = await import("./session.js");
    clearSession(from);
    return sendWhatsApp(from, "Conversation reset. How can I help you with your tax queries?").catch(() => {});
  }

  console.log(`[${new Date().toISOString()}] ${from}: ${body}`);

  // Process in background — Twilio already got its HTTP 200 above
  processAndReply(from, body).catch((err) => {
    console.error(`Error for ${from}:`, err.message);
    sendWhatsApp(from, "Sorry, I encountered an error. Please try again or contact IRAS at 1800-356-8300.").catch(() => {});
  });
}

async function processAndReply(from, body) {
  const history = getHistory(from);
  const result  = await answer(body, history);
  addTurn(from, body, result.answer);

  const reply = truncate(result.answer);

  console.log(`[${new Date().toISOString()}] → ${reply.slice(0, 80)}...`);
  await sendWhatsApp(from, reply);
}