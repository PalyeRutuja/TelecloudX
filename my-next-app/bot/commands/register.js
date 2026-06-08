/**
 * bot/commands/register.js
 * ------------------------
 * Handles /register
 * Walks the user through creating a new account by calling
 * POST /api/auth/register, then stores the returned token in session.
 *
 * Flow:
 *   1. Bot asks for email
 *   2. Bot asks for password
 *   3. Bot calls /api/auth/register
 *   4. On success, bot stores token and welcomes the user
 */

const { apiRequest, setSession } = require("../lib/session");

// Track registration state per chat ID
const registrationState = new Map();

function getAuthUser(data) {
  const user = data?.user ?? data ?? {};
  return {
    id: user.userId ?? user.id ?? data?.userId ?? data?.uid ?? "",
    email: user.email ?? data?.email ?? "",
    name: user.name ?? data?.name ?? "",
  };
}

module.exports = function registerRegister(bot) {
  bot.onText(/^\/register$/, (msg) => {
    const chatId = msg.chat.id;
    registrationState.set(chatId, { step: "email" });
    bot.sendMessage(
      chatId,
      "📝 Let's create your TelecloudX account.\n\nPlease enter your email address:"
    );
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const state = registrationState.get(chatId);
    if (!state) return;

    // Ignore command messages
    if (msg.text?.startsWith("/")) return;

    if (state.step === "email") {
      state.email = msg.text.trim();
      state.step = "password";
      bot.sendMessage(chatId, "🔒 Please enter a password (min 6 characters):");
      return;
    }

    if (state.step === "password") {
      state.password = msg.text.trim();
      registrationState.delete(chatId);

      bot.sendMessage(chatId, "⏳ Creating your account...");

      const { data, error } = await apiRequest(
        "POST",
        "/api/auth/register",
        chatId,
        {
          email: state.email,
          password: state.password,
        }
      );

      if (error || !data?.token) {
        bot.sendMessage(
          chatId,
          `❌ Registration failed: ${error || "No token returned. Please try again."}`
        );
        return;
      }

      const authUser = getAuthUser(data);
      setSession(chatId, {
        token: data.token,
        userId: authUser.id,
        email: authUser.email,
        name: authUser.name,
      });

      bot.sendMessage(
        chatId,
        `✅ Account created successfully!\n\nEmail: ${authUser.email}\n\n` +
          "Use /start <token> to link this Telegram chat to your account, " +
          "or use /list, /balance, /pay directly."
      );
    }
  });
};
