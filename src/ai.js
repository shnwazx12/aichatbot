import axios from "axios";
import { config } from "./config.js";
import { buildSystemPrompt } from "./messages.js";

function cleanError(err) {
  const msg =
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    "Unknown error";

  return msg;
}

export async function askChatGPT(userText, mode) {
  if (!config.OPENAI_API_KEY) return "❌ ChatGPT API key missing.";

  const system = buildSystemPrompt(mode);

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userText }
        ],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${config.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    return res.data?.choices?.[0]?.message?.content?.trim() || "⚠️ No reply.";
  } catch (err) {
    return `⚠️ ChatGPT Error: ${cleanError(err)}`;
  }
}

export async function askGemini(userText, mode) {
  if (!config.GEMINI_API_KEY) return "❌ Gemini API key missing.";

  const system = buildSystemPrompt(mode);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    config.GEMINI_API_KEY;

  try {
    const res = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `${system}\n\nUser: ${userText}` }]
          }
        ]
      },
      { timeout: 60000 }
    );

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ No reply."
    );
  } catch (err) {
    return `⚠️ Gemini Error: ${cleanError(err)}`;
  }
}

export async function askAI({ text, mode, engine }) {
  if (engine === "chatgpt") return askChatGPT(text, mode);
  return askGemini(text, mode);
}
