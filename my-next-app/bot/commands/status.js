/**
 * bot/commands/status.js
 * ----------------------
 * Handles /status <vm_id>
 * Returns the status of a specific VM by calling GET /api/vms/[id].
 */

const { apiRequest, getSession } = require("../lib/session");

module.exports = function registerStatus(bot) {
  bot.onText(/^\/status\s+(.+)$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const vmId = match[1]?.trim();

    if (!vmId) {
      bot.sendMessage(chatId, "Usage: /status <vm_id>");
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
      "GET",
      `/api/vms/${encodeURIComponent(vmId)}`,
      chatId
    );

    if (error) {
      bot.sendMessage(chatId, `❌ Failed to fetch VM status: ${error}`);
      return;
    }

    bot.sendMessage(
      chatId,
      `🖥️ *${data.name || data.displayname || "VM"}* — \`${data.id || data.vmId}\`\n` +
        `Status: ${data.state || data.status}\n` +
        `Specs: ${JSON.stringify(data.specs || {})}\n` +
        `Created: ${data.created || data.createdAt}`,
      { parse_mode: "Markdown" }
    );
  });
};
