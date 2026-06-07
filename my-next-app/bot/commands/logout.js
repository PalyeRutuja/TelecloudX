/**
 * bot/commands/logout.js
 * ----------------------
 * Handles /logout
 * Calls POST /api/auth/logout to revoke server-side tokens,
 * then clears the local in-memory session for this Telegram chat.
 */

const { apiRequest, clearSession } = require("../lib/session");

module.exports = function registerLogout(bot) {
  bot.onText(/^\/logout$/, async (msg) => {
    const chatId = msg.chat.id;

    const { error } = await apiRequest("POST", "/api/auth/logout", chatId);

    // Always clear local session regardless of server response
    clearSession(chatId);

    if (error) {
      bot.sendMessage(
        chatId,
        `⚠️ Server logout returned an error, but your local session has been cleared.\n(${error})`
      );
      return;
    }

    bot.sendMessage(chatId, "👋 You have been logged out. Your Telegram account is now unlinked.");
  });
};
