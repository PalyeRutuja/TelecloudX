/**
 * bot/commands/deploy.js
 * ----------------------
 * Handles /deploy
 * Starts a step-by-step VM deployment flow by calling POST /api/vms/deploy.
 * The user is prompted for template, service offering, zone, and VM name.
 *
 * Flow:
 *   1. Ask for VM name
 *   2. Ask for template ID
 *   3. Ask for service offering ID
 *   4. Ask for zone ID
 *   5. Confirm and call /api/vms/deploy
 */

const { apiRequest, getSession } = require("../lib/session");

// Track deployment state per chat ID
const deployState = new Map();

function requireAuth(chatId, bot) {
  const session = getSession(chatId);
  if (!session || !session.token) {
    bot.sendMessage(
      chatId,
      "❌ You need to log in first. Use /login or /register."
    );
    return null;
  }
  return session;
}

module.exports = function registerDeploy(bot) {
  bot.onText(/^\/deploy$/, (msg) => {
    const chatId = msg.chat.id;
    if (!requireAuth(chatId, bot)) return;

    deployState.set(chatId, { step: "name" });
    bot.sendMessage(chatId, "🚀 Let's deploy a new VM.\n\nStep 1: What should we name this VM?");
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const state = deployState.get(chatId);
    if (!state) return;

    // Ignore command messages
    if (msg.text?.startsWith("/")) return;

    const session = requireAuth(chatId, bot);
    if (!session) {
      deployState.delete(chatId);
      return;
    }

    if (state.step === "name") {
      state.name = msg.text.trim();
      state.step = "template";
      bot.sendMessage(
        chatId,
        "Step 2: Enter the Template ID (e.g., ubuntu-22-04):"
      );
      return;
    }

    if (state.step === "template") {
      state.templateId = msg.text.trim();
      state.step = "offering";
      bot.sendMessage(
        chatId,
        "Step 3: Enter the Service Offering ID (e.g., small, medium, large):"
      );
      return;
    }

    if (state.step === "offering") {
      state.serviceOfferingId = msg.text.trim();
      state.step = "zone";
      bot.sendMessage(chatId, "Step 4: Enter the Zone ID (e.g., zone-1):");
      return;
    }

    if (state.step === "zone") {
      state.zoneId = msg.text.trim();
      deployState.delete(chatId);

      bot.sendMessage(chatId, "⏳ Deploying your VM...");

      const { data, error } = await apiRequest(
        "POST",
        "/api/vms/deploy",
        chatId,
        {
          name: state.name,
          templateId: state.templateId,
          serviceOfferingId: state.serviceOfferingId,
          zoneId: state.zoneId,
        }
      );

      if (error) {
        bot.sendMessage(chatId, `❌ Deployment failed: ${error}`);
        return;
      }

      bot.sendMessage(
        chatId,
        `✅ VM deployment initiated!\n\nResponse:\n\`\`\`json\n${JSON.stringify(
          data,
          null,
          2
        )}\n\`\`\``,
        { parse_mode: "Markdown" }
      );
    }
  });
};
