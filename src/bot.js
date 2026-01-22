import express from "express";
import { Telegraf, Markup } from "telegraf";
import { config } from "./config.js";
import { connectDB, getOrCreateUser, User } from "./db.js";
import { askAI } from "./ai.js";
import { startCaption, helpText } from "./messages.js";

if (!config.BOT_TOKEN) throw new Error("❌ BOT_TOKEN missing in .env");

const bot = new Telegraf(config.BOT_TOKEN);

// Render health server (PORT 10000)
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is running fast ⚡"));
app.listen(config.PORT, () => console.log(`✅ Server on PORT ${config.PORT}`));

// Connect DB
await connectDB();

// Start Image (use any direct image link)
const START_IMAGE =
  "https://i.ibb.co/Zm6Vx4w/ai-bot-banner.jpg"; // change if you want

function startButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.url("👑 OWNER", `https://t.me/${config.OWNER_USERNAME}`),
      Markup.button.url(
        "➕ ADD BOT",
        `https://t.me/${config.BOT_USERNAME}?startgroup=true`
      )
    ],
    [Markup.button.callback("📌 HELP", "HELP_MENU")]
  ]);
}

function modeButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🌸 NORMAL", "MODE_normal"),
      Markup.button.callback("💖 ROMANCE", "MODE_romance")
    ],
    [Markup.button.callback("🔥 SEXY", "MODE_sexy")]
  ]);
}

function engineButtons() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🤖 Gemini", "ENG_gemini"),
      Markup.button.callback("🧠 ChatGPT", "ENG_chatgpt")
    ]
  ]);
}

// Commands
bot.start(async (ctx) => {
  await getOrCreateUser(ctx);

  try {
    await ctx.replyWithPhoto(START_IMAGE, {
      caption: startCaption(config.OWNER_USERNAME),
      parse_mode: "Markdown",
      ...startButtons()
    });
  } catch {
    await ctx.reply(startCaption(config.OWNER_USERNAME), startButtons());
  }
});

bot.command("help", async (ctx) => {
  await getOrCreateUser(ctx);
  await ctx.reply(helpText, { parse_mode: "Markdown", ...startButtons() });
});

bot.command("ping", async (ctx) => {
  const start = Date.now();
  const msg = await ctx.reply("⚡ Checking speed...");
  const ms = Date.now() - start;
  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
    `✅ Pong: ${ms}ms ⚡`
  );
});

bot.command("mode", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  await ctx.reply(
    `✨ Current Mode: *${user.mode.toUpperCase()}*\n\nChoose new mode 👇`,
    { parse_mode: "Markdown", ...modeButtons() }
  );
});

bot.command("engine", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  await ctx.reply(
    `⚙️ Current Engine: *${user.engine.toUpperCase()}*\n\nChoose engine 👇`,
    { parse_mode: "Markdown", ...engineButtons() }
  );
});

// Buttons actions
bot.action("HELP_MENU", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(helpText, { parse_mode: "Markdown", ...startButtons() });
});

bot.action(/MODE_(.+)/, async (ctx) => {
  const mode = ctx.match[1];
  await ctx.answerCbQuery("✅ Mode Updated!");

  const userId = ctx.from.id;
  await User.updateOne({ userId }, { $set: { mode } }, { upsert: true });

  await ctx.reply(`✨ Done! Mode set to: *${mode.toUpperCase()}* 💬`, {
    parse_mode: "Markdown"
  });
});

bot.action(/ENG_(.+)/, async (ctx) => {
  const engine = ctx.match[1];
  await ctx.answerCbQuery("✅ Engine Updated!");

  const userId = ctx.from.id;
  await User.updateOne({ userId }, { $set: { engine } }, { upsert: true });

  await ctx.reply(`⚙️ Done! Engine set to: *${engine.toUpperCase()}* 🤖`, {
    parse_mode: "Markdown"
  });
});

// Chat Reply (fast)
bot.on("text", async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  try {
    await ctx.sendChatAction("typing");

    const reply = await askAI({
      text,
      mode: user.mode,
      engine: user.engine
    });

    await ctx.reply(reply);
  } catch (err) {
    console.log(err?.message || err);
    await ctx.reply("⚠️ AI busy right now. Try again in 5 sec 😅");
  }
});

// Launch
bot.launch().then(() => console.log("✅ Bot Started Successfully ⚡"));

// Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
