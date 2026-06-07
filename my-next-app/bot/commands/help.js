/**
 * bot/commands/help.js
 * --------------------
 * Handles /help
 * Lists all available commands with descriptions.
 */

module.exports = function registerHelp(bot) {
  bot.onText(/^\/help$/, (msg) => {
    const chatId = msg.chat.id;
    const text =
      "📖 *TelecloudX Bot Commands*\n\n" +
      "`/start <token>` — Link your Telegram account\n" +
      "`/register` — Create a new account\n" +
      "`/login` — Log in to existing account\n" +
      "`/logout` — Log out and clear session\n" +
      "`/deploy` — Start VM deployment flow\n" +
      "`/list` — List all your VMs\n" +
      "`/status <vm_id>` — Get status of a specific VM\n" +
      "`/stop <vm_id>` — Stop a specific VM\n" +
      "`/pay` — Top-up wallet via UPI (Razorpay)\n" +
      "`/balance` — Check wallet balance\n" +
      "`/help` — Show this help message";

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  });
};
