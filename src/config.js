import dotenv from "dotenv";
dotenv.config();

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  MONGO_URI: process.env.MONGO_URI,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  OWNER_USERNAME: process.env.OWNER_USERNAME || "yourusername",
  BOT_USERNAME: process.env.BOT_USERNAME || "yourbotusername",

  PORT: parseInt(process.env.PORT || "10000", 10),
  DEFAULT_ENGINE: (process.env.DEFAULT_ENGINE || "gemini").toLowerCase()
};
