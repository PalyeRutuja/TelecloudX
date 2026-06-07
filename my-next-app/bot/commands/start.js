/**
 * bot/commands/start.js
 * ---------------------
 * Handles /start <token>
 * Links the Telegram chat ID to the user's Firebase account
 * by calling POST /api/telegram/link with the one-time token.
 */

const { apiRequest } = require("../lib/session");

module.exports = function registerStart(bot) {
  bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const token = match[1]?.trim();

    if (!token) {
      bot.sendMessage(
        chatId,
        "Welcome to TelecloudX!\n\n" +
          "To link your account, click the 'Connect Telegram' button on the website dashboard.\n" +
          "Or use /register to create a new account."
      );
      return;
    }

    const { error } = await apiRequest("POST", "/api/telegram/link", chatId, {
      token,
      telegramId: chatId,
    });

    if (error) {
      bot.sendMessage(chatId, `❌ ${error}`);
      return;
    }

    bot.sendMessage(
      chatId,
      "✅ Your Telegram account has been linked successfully!\nYou can now use /list, /deploy, /balance, etc."
    );
  });
};
