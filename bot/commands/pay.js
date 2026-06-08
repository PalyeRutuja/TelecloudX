/**
 * bot/commands/pay.js
 * -------------------
 * Handles /pay
 * Initiates a UPI payment via Razorpay by calling POST /api/billing/topup,
 * then sends the payment link to the user in chat.
 */

const { apiRequest, getSession } = require("../lib/session");

module.exports = function registerPay(bot) {
  bot.onText(/^\/pay$/, async (msg) => {
    const chatId = msg.chat.id;

    const session = getSession(chatId);
    if (!session || !session.token) {
      bot.sendMessage(
        chatId,
        "❌ You need to log in first. Use /login or /register."
      );
      return;
    }

    bot.sendMessage(chatId, "⏳ Generating payment link...");

    // Default top-up amount: ₹100
    const { data, error } = await apiRequest(
      "POST",
      "/api/billing/topup",
      chatId,
      {
        amount: 100,
        currency: "INR",
        method: "upi",
      }
    );

    if (error) {
      bot.sendMessage(chatId, `❌ Failed to initiate payment: ${error}`);
      return;
    }

    const orderId = data?.orderId || data?.id || data?.razorpayOrderId;
    const paymentLink = data?.paymentLink || data?.short_url;

    let reply = "💳 *Top-up ₹100*\n\n";
    if (paymentLink) {
      reply += `Click the link below to pay via UPI:\n[Pay Now](${paymentLink})\n\n`;
    }
    if (orderId) {
      reply += `Order ID: \`${orderId}\`\n`;
    }
    reply += "Your balance will be updated automatically after payment.";

    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
  });
};
