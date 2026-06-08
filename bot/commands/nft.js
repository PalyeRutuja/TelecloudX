/**
 * bot/commands/nft.js
 * -------------------
 * /nft command — lists user's Deployment Proof NFTs with Pinata fallback.
 */

const { apiRequest } = require("../lib/session");

module.exports = function registerNftCommand(bot) {
  bot.onText(/^\/nft$/, async (msg) => {
    const chatId = msg.chat.id;
    const session = require("../lib/session").getSession(chatId);

    if (!session?.token) {
      bot.sendMessage(
        chatId,
        "❌ You must be logged in to view your NFTs.\n\nUse 🔑 Login to continue."
      );
      return;
    }

    bot.sendMessage(chatId, "⏳ Fetching your Deployment Proof NFTs...");

    const { data, error, status } = await apiRequest("GET", "/api/nft/list", chatId);
    if (error) {
      bot.sendMessage(chatId, `❌ Failed to fetch NFTs: ${error}`);
      return;
    }

    const nfts = data?.nfts || [];
    if (nfts.length === 0) {
      bot.sendMessage(
        chatId,
        "📭 You have no Deployment Proof NFTs yet.\n\nDeploy a VM to mint your first NFT! 🚀"
      );
      return;
    }

    let message = `🎨 *Your Deployment Proof NFTs* (${nfts.length})\n\n`;
    nfts.forEach((nft, i) => {
      message += `${i + 1}. *VM ${nft.vmId || "Unknown"}*\n`;
      message += `   Source: ${nft.source}\n`;
      message += `   Region: ${nft.region}\n`;
      message += `   OS: ${nft.os}\n`;
      message += `   CPU: ${nft.cpu} vCPU | RAM: ${nft.ram} MB\n`;
      message += `   [IPFS Metadata](${nft.tokenURI})\n`;
      if (nft.explorerUrl) {
        message += `   [Explorer](${nft.explorerUrl})\n`;
      }
      message += `\n`;
    });

    bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  });
};
