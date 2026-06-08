/**
 * bot/commands/list.js
 * --------------------
 * Handles /list
 * Lists all VMs for the logged-in user by calling GET /api/vms.
 */

const { apiRequest, getSession } = require("../lib/session");

module.exports = function registerList(bot) {
  bot.onText(/^\/list$/, async (msg) => {
    const chatId = msg.chat.id;

    const session = getSession(chatId);
    if (!session || !session.token) {
      bot.sendMessage(
        chatId,
        "❌ You need to log in first. Use /login or /register."
      );
      return;
    }

    const { data, error } = await apiRequest("GET", "/api/vms", chatId);

    if (error) {
      bot.sendMessage(chatId, `❌ Failed to fetch VMs: ${error}`);
      return;
    }

    // Handle both array and { vms: array } response shapes
    const vms = Array.isArray(data) ? data : data?.vms;

    if (!vms || vms.length === 0) {
      bot.sendMessage(chatId, "📭 You have no VMs. Use /deploy to create one.");
      return;
    }

    let reply = "🖥️ *Your VMs:*\n\n";
    vms.forEach((vm) => {
      reply += `• *${vm.name || vm.displayname || "Unnamed"}* — \`${vm.id || vm.vmId}\`\n  Status: ${vm.state || vm.status}\n\n`;
    });

    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
  });
};
