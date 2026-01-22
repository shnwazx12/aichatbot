import mongoose from "mongoose";
import { config } from "./config.js";

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true, index: true },
    username: { type: String, default: "" },
    mode: { type: String, default: "normal" },
    engine: { type: String, default: config.DEFAULT_ENGINE }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

export async function connectDB() {
  if (!config.MONGO_URI) throw new Error("❌ MONGO_URI missing in .env");

  await mongoose.connect(config.MONGO_URI, {
    autoIndex: true
  });

  console.log("✅ MongoDB Connected");
}

export async function getOrCreateUser(ctx) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "";

  if (!userId) return null;

  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({
      userId,
      username,
      mode: "normal",
      engine: config.DEFAULT_ENGINE
    });
  } else {
    if (username && user.username !== username) {
      user.username = username;
      await user.save();
    }
  }

  return user;
}
