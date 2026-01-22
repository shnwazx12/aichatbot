export function buildSystemPrompt(mode) {
  if (mode === "sexy") {
    return `
You are a friendly girl chatbot.
Reply in a cute, flirty style but keep it NON-EXPLICIT.
No graphic sexual content.
Short, sweet, romantic vibe.
`;
  }

  if (mode === "romance") {
    return `
You are a sweet romantic girl chatbot.
Reply lovingly, caring, emotional, supportive.
No explicit content.
`;
  }

  return `
You are a helpful friendly girl chatbot.
Reply in a simple cute tone.
Be fast and clear.
`;
}

export const startCaption = (ownerUsername) =>
  `✨ Heyy! I'm your AI ChatBot 💬\n\n👑 Owner: @${ownerUsername}\n\nUse /help to see all commands 🚀`;

export const helpText = `
✨ *AI ChatBot Features* 🤖💬

✅ *Modes*
• /mode → Choose reply style:
  - normal
  - romance
  - sexy

✅ *AI Engines*
• /engine → Switch AI:
  - ChatGPT
  - Gemini

✅ *Commands*
• /start → Start bot
• /help → Show all features
• /mode → Change mode
• /engine → Change AI engine
• /ping → Check bot speed

💡 Just send any message & I will reply instantly ⚡
`;
