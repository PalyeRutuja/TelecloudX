/**
 * bot/commands/stop.js
 * --------------------
 * Handles /stop <vm_id>
 * Stops a specific VM by calling POST /api/vms/[id]/stop.
 */

const { apiRequest, getSession } = require("../lib/session");

module.exports = function registerStop(bot) {
  bot.onText(/^\/stop\s+(.+)$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const vmId = match[1]?.trim();

    if (!vmId) {
      bot.sendMessage(chatId, "Usage: /stop <vm_id>");
      return;
    }

    const session = getSession(chatId);
    if (!session || !session.token) {
      bot.sendMessage(
        chatId,
        "❌ You need to log in first. Use /login or /register."
      );
      return;
    }

    const { data, error } = await apiRequest(
      "POST",
      `/api/vms/${encodeURIComponent(vmId)}/stop`,
      chatId
    );

    if (error) {
      bot.sendMessage(chatId, `❌ Failed to stop VM: ${error}`);
      return;
    }

    bot.sendMessage(
      chatId,
      `🛑 VM \`${vmId}\` stop request sent.\n\nResponse:\n\`\`\`json\n${JSON.stringify(
        data,
        null,
        2
      )}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  });
};
