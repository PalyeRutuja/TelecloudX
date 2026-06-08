/**
 * bot/commands/login.js
 * ---------------------
 * Handles /login
 * Walks the user through logging in by calling POST /api/auth/login,
 * then stores the returned token in session for authenticated commands.
 *
 * Flow:
 *   1. Bot asks for email
 *   2. Bot asks for password
 *   3. Bot calls /api/auth/login
 *   4. On success, bot stores token
 */

const { apiRequest, setSession } = require("../lib/session");

// Track login state per chat ID
const loginState = new Map();

module.exports = function registerLogin(bot) {
  bot.onText(/^\/login$/, (msg) => {
    const chatId = msg.chat.id;
    loginState.set(chatId, { step: "email" });
    bot.sendMessage(
      chatId,
      "🔑 Please log in to your TelecloudX account.\n\nEnter your email address:"
    );
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const state = loginState.get(chatId);
    if (!state) return;

    // Ignore command messages
    if (msg.text?.startsWith("/")) return;

    if (state.step === "email") {
      state.email = msg.text.trim();
      state.step = "password";
      bot.sendMessage(chatId, "🔒 Enter your password:");
      return;
    }

    if (state.step === "password") {
      state.password = msg.text.trim();
      loginState.delete(chatId);

      bot.sendMessage(chatId, "⏳ Logging you in...");

      const { data, error } = await apiRequest(
        "POST",
        "/api/auth/login",
        chatId,
        {
          email: state.email,
          password: state.password,
        }
      );

      if (error || !data?.token) {
        bot.sendMessage(
          chatId,
          `❌ Login failed: ${error || "Invalid credentials."}`
        );
        return;
      }

      setSession(chatId, {
        token: data.token,
        uid: data.uid,
        email: data.email,
      });

      bot.sendMessage(
        chatId,
        `✅ Welcome back, ${data.email}!\n\n` +
          "Use /list, /balance, /pay, /deploy, /status, or /stop."
      );
    }
  });
};
