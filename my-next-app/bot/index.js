/**
 * bot/index.js
 * ------------
 * Entry point for the TelecloudX Telegram bot.
 * Uses a unified state machine for all conversations.
 *
 * Usage:
 *   node bot/index.js
 */

require("dotenv").config({ path: ".env.local" });
const express = require("express");

const TelegramBot = require("node-telegram-bot-api");
const { cleanupExpired } = require("./lib/session");
const stateMachine = require("./state-machine");

// Express server for Render
const app = express();

app.get("/", (req, res) => {
  res.send("TeleCloudX Bot Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Bot] Health server running on port ${PORT}`);
});

// Validate required env vars
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("[Bot] Missing TELEGRAM_BOT_TOKEN in environment.");
  process.exit(1);
}

// Create bot instance in polling mode
const bot = new TelegramBot(token, { polling: true });

// Periodic cleanup of expired sessions
setInterval(cleanupExpired, 60 * 1000); // every minute

// Register the unified state machine handler
stateMachine(bot);

console.log("[Bot] TelecloudX Telegram bot is running...");

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("[Bot] Stopping polling...");
  bot.stopPolling();
  process.exit(0);
});
