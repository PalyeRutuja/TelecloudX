/**
 * bot/commands/balance.js
 * -----------------------
 * Handles /balance
 * Returns the wallet balance of the logged-in user by calling GET /api/billing/balance.
 */

const { apiRequest, getSession } = require("../lib/session");

module.exports = function registerBalance(bot) {
  bot.onText(/^\/balance$/, async (msg) => {
    const chatId = msg.chat.id;

    const session = getSession(chatId);
    if (!session || !session.token) {
      bot.sendMessage(
        chatId,
        "❌ You need to log in first. Use /login or /register."
      );
      return;
    }

    const { data, error } = await apiRequest("GET", "/api/billing/balance", chatId);

    if (error) {
      bot.sendMessage(chatId, `❌ Failed to fetch balance: ${error}`);
      return;
    }

    const balance =
      typeof data?.balance === "number" ? data.balance : data?.walletBalance || 0;

    bot.sendMessage(
      chatId,
      `💰 Your wallet balance: *₹${balance.toFixed(2)}*`,
      { parse_mode: "Markdown" }
    );
  });
};
