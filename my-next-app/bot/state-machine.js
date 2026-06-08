/**
 * bot/state-machine.js
 * --------------------
 * Unified state machine for the TelecloudX Telegram bot.
 */

const {
  getSession, setSession, clearSession,
  getState, setState, clearState,
  isExpired, apiRequest,
} = require("./lib/session");

const {
  MESSAGES, MAIN_MENU_KEYBOARD, AUTH_MENU_KEYBOARD,
  CANCEL_KEYBOARD, REMOVE_KEYBOARD,
} = require("./lib/messages");

const {
  PRESET_AMOUNTS, PAYMENT_METHODS,
  createTransaction, generateUPIUrl, generateTopupPageLink,
  createRazorpayOrder, createStripeSession,
  verifyWalletTopup, simulateUPIPayment,
} = require("./lib/payments");

const MAX_LOGIN_RETRIES = 3;
const VM_DEPLOYMENT_COST = 10;

module.exports = function registerStateMachine(bot) {
  function sendMenu(chatId, session) {
    if (session && session.token) {
      bot.sendMessage(chatId, MESSAGES.MAIN_MENU, { parse_mode: "Markdown", ...MAIN_MENU_KEYBOARD });
    } else {
      bot.sendMessage(chatId, MESSAGES.AUTH_MENU, { parse_mode: "Markdown", ...AUTH_MENU_KEYBOARD });
    }
  }

  function handleApiError(bot, chatId, error, status) {
    if (status === 401) {
      clearSession(chatId); clearState(chatId);
      bot.sendMessage(chatId, "Session expired. Please log in again.", AUTH_MENU_KEYBOARD);
      return;
    }
    bot.sendMessage(chatId, `Error: ${error || MESSAGES.ERROR}`, { parse_mode: "Markdown" });
  }

  /* ── Entry: /start ── */
  bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const token = match[1]?.trim();
    clearState(chatId);
    if (!token) {
      bot.sendMessage(chatId, MESSAGES.WELCOME, { parse_mode: "Markdown", ...AUTH_MENU_KEYBOARD });
      return;
    }
    bot.sendMessage(chatId, MESSAGES.PROCESSING);
    const { error } = await apiRequest("POST", "/api/telegram/link", chatId, { token, telegramId: chatId });
    if (error) {
      bot.sendMessage(chatId, `❌ ${error}`);
      bot.sendMessage(chatId, MESSAGES.WELCOME, { parse_mode: "Markdown", ...AUTH_MENU_KEYBOARD });
      return;
    }
    bot.sendMessage(chatId, "✅ Telegram linked! Please log in.", { parse_mode: "Markdown", ...AUTH_MENU_KEYBOARD });
  });

  /* ── /cancel ── */
  bot.onText(/^\/cancel$/, (msg) => {
    const chatId = msg.chat.id;
    clearState(chatId);
    bot.sendMessage(chatId, MESSAGES.CANCELLED, REMOVE_KEYBOARD);
    sendMenu(chatId, getSession(chatId));
  });

  /* ── /help ── */
  bot.onText(/^\/help$/, (msg) => {
    bot.sendMessage(msg.chat.id, MESSAGES.HELP, { parse_mode: "Markdown" });
  });

  /* ── Shortcuts ── */
  bot.onText(/^\/deploy$/, (msg) => {
    const chatId = msg.chat.id;
    const s = getSession(chatId);
    if (!s?.token) { bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    setState(chatId, { flow: "deploy", step: "name", data: {} });
    bot.sendMessage(chatId, MESSAGES.DEPLOY_NAME, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
  });

  bot.onText(/^\/topup$/, (msg) => {
    const chatId = msg.chat.id;
    const s = getSession(chatId);
    if (!s?.token) { bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    setState(chatId, { flow: "topup", step: "amount", data: {} });
    bot.sendMessage(chatId, MESSAGES.TOPUP_AMOUNT, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
  });

  bot.onText(/^\/account$/, async (msg) => {
    const chatId = msg.chat.id; const s = getSession(chatId);
    if (!s?.token) { bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    await showAccount(bot, chatId, s);
  });

  bot.onText(/^\/list$/, async (msg) => {
    const chatId = msg.chat.id; const s = getSession(chatId);
    if (!s?.token) { bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    await listVMs(bot, chatId, s);
  });

  bot.onText(/^\/balance$/, async (msg) => {
    const chatId = msg.chat.id; const s = getSession(chatId);
    if (!s?.token) { bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    await showBalance(bot, chatId, s);
  });

  /* ── Main message handler ── */
  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text?.trim();
      if (!text || text.startsWith("/")) return;

      if (isExpired(chatId)) {
        clearState(chatId);
        bot.sendMessage(chatId, MESSAGES.EXPIRED);
        sendMenu(chatId, getSession(chatId));
        return;
      }

      const state = getState(chatId);
      const session = getSession(chatId);

      if (!state) { await handleNoState(bot, chatId, text, session); return; }

      switch (state.flow) {
        case "login": await handleLoginFlow(bot, chatId, text, state); break;
        case "register": await handleRegisterFlow(bot, chatId, text, state); break;
        case "deploy": await handleDeployFlow(bot, chatId, text, state, session); break;
        case "topup": await handleTopupFlow(bot, chatId, text, state, session); break;
        default:
          clearState(chatId);
          bot.sendMessage(chatId, MESSAGES.INVALID_INPUT);
          sendMenu(chatId, session);
      }
    } catch (err) {
      console.error("[BOT ERROR] Unhandled error in message handler:", err);
      try {
        const chatId = msg.chat?.id;
        if (chatId) {
          bot.sendMessage(chatId, "⚠️ An unexpected error occurred. Please try again or type /start.");
          sendMenu(chatId, getSession(chatId));
        }
      } catch (replyErr) {
        console.error("[BOT ERROR] Failed to send error message:", replyErr);
      }
    }
  });

  /* ── No-state menu handler ── */
  async function handleNoState(bot, chatId, text, session) {
    const lower = text.toLowerCase();
    if (lower === "🔑 login" || lower === "login") {
      setState(chatId, { flow: "login", step: "email", data: { retries: 0 } });
      bot.sendMessage(chatId, MESSAGES.LOGIN_EMAIL, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
      return;
    }
    if (lower === "📝 register" || lower === "register") {
      setState(chatId, { flow: "register", step: "name", data: {} });
      bot.sendMessage(chatId, MESSAGES.REGISTER_NAME, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
      return;
    }
    if (lower === "❓ help" || lower === "help") {
      bot.sendMessage(chatId, MESSAGES.HELP, { parse_mode: "Markdown" }); return;
    }
    if (!session?.token) {
      bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return;
    }
    if (lower === "🚀 deploy vm" || lower === "deploy vm") {
      setState(chatId, { flow: "deploy", step: "name", data: {} });
      bot.sendMessage(chatId, MESSAGES.DEPLOY_NAME, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
      return;
    }
    if (lower === "💰 top up balance" || lower === "top up balance") {
      setState(chatId, { flow: "topup", step: "amount", data: {} });
      bot.sendMessage(chatId, MESSAGES.TOPUP_AMOUNT, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
      return;
    }
    if (lower === "👤 my account" || lower === "my account") { await showAccount(bot, chatId, session); return; }
    if (lower === "🚪 logout" || lower === "logout") {
      await apiRequest("POST", "/api/auth/logout", chatId);
      clearSession(chatId);
      bot.sendMessage(chatId, MESSAGES.LOGOUT_SUCCESS, REMOVE_KEYBOARD);
      sendMenu(chatId, null);
      return;
    }
    bot.sendMessage(chatId, MESSAGES.INVALID_INPUT);
    sendMenu(chatId, session);
  }

  /* ── Login Flow ── */
  async function handleLoginFlow(bot, chatId, text, state) {
    if (state.step === "email") {
      state.data.email = text; state.step = "password"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.LOGIN_PASSWORD, CANCEL_KEYBOARD); return;
    }
    if (state.step === "password") {
      const { email, retries } = state.data;
      bot.sendMessage(chatId, MESSAGES.PROCESSING);
      const { data, error } = await apiRequest("POST", "/api/auth/login", chatId, { email, password: text });
      if (error || !data?.success) {
        const newRetries = (retries || 0) + 1;
        if (newRetries >= MAX_LOGIN_RETRIES) {
          clearState(chatId);
          bot.sendMessage(chatId, MESSAGES.LOGIN_MAX_RETRIES, AUTH_MENU_KEYBOARD); return;
        }
        setState(chatId, { flow: "login", step: "email", data: { retries: newRetries } });
        bot.sendMessage(chatId, `${MESSAGES.LOGIN_FAILED}\n\nAttempt ${newRetries}/${MAX_LOGIN_RETRIES}`, CANCEL_KEYBOARD);
        return;
      }
      setSession(chatId, { token: data.token, userId: data.user.id, name: data.user.name, email: data.user.email });
      clearState(chatId);
      bot.sendMessage(chatId, MESSAGES.LOGIN_SUCCESS(data.user.name), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
      sendMenu(chatId, getSession(chatId));
    }
  }

  /* ── Register Flow ── */
  async function handleRegisterFlow(bot, chatId, text, state) {
    if (state.step === "name") { state.data.name = text; state.step = "email"; setState(chatId, state); bot.sendMessage(chatId, MESSAGES.REGISTER_EMAIL, CANCEL_KEYBOARD); return; }
    if (state.step === "email") { state.data.email = text; state.step = "password"; setState(chatId, state); bot.sendMessage(chatId, MESSAGES.REGISTER_PASSWORD, CANCEL_KEYBOARD); return; }
    if (state.step === "password") {
      if (text.length < 6) { bot.sendMessage(chatId, MESSAGES.REGISTER_PASSWORD_SHORT, CANCEL_KEYBOARD); return; }
      state.data.password = text; state.step = "confirm"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.REGISTER_CONFIRM, CANCEL_KEYBOARD); return;
    }
    if (state.step === "confirm") {
      const { name, email, password } = state.data;
      if (password !== text) { state.step = "password"; setState(chatId, state); bot.sendMessage(chatId, MESSAGES.REGISTER_PASSWORD_MISMATCH, CANCEL_KEYBOARD); return; }
      bot.sendMessage(chatId, MESSAGES.PROCESSING);
      const { data, error, status } = await apiRequest("POST", "/api/auth/register", chatId, { name, email, password, confirmPassword: text });
      if (error || !data?.success) {
        if (status === 409) { clearState(chatId); bot.sendMessage(chatId, MESSAGES.REGISTER_EMAIL_EXISTS, AUTH_MENU_KEYBOARD); return; }
        bot.sendMessage(chatId, MESSAGES.REGISTER_FAILED(error || "Unknown"), CANCEL_KEYBOARD); return;
      }
      setSession(chatId, { token: data.token, userId: data.user.id, name: data.user.name, email: data.user.email });
      clearState(chatId);
      bot.sendMessage(chatId, MESSAGES.REGISTER_SUCCESS(data.user.name), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
      sendMenu(chatId, getSession(chatId));
    }
  }

  /* ── Deploy Flow ── */
  async function handleDeployFlow(bot, chatId, text, state, session) {
    if (!session?.token) { clearState(chatId); bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }
    if (state.step === "name") {
      state.data.name = text; state.step = "fetch_options"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.PROCESSING);
      const { data, error, status } = await apiRequest("GET", "/api/cloudstack/vms/deploy", chatId);
      if (error) { handleApiError(bot, chatId, error, status); clearState(chatId); return; }
      state.data.templates = data.templates || []; state.data.offerings = data.offerings || []; state.data.zones = data.zones || [];
      state.step = "template"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.DEPLOY_TEMPLATE(state.data.templates), CANCEL_KEYBOARD); return;
    }
    if (state.step === "template") {
      const idx = parseInt(text, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= (state.data.templates || []).length) { bot.sendMessage(chatId, "Invalid selection. Reply with a number.", CANCEL_KEYBOARD); return; }
      state.data.templateId = state.data.templates[idx].id; state.data.templateName = state.data.templates[idx].name;
      state.step = "offering"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.DEPLOY_OFFERING(state.data.offerings), CANCEL_KEYBOARD); return;
    }
    if (state.step === "offering") {
      const idx = parseInt(text, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= (state.data.offerings || []).length) { bot.sendMessage(chatId, "Invalid selection. Reply with a number.", CANCEL_KEYBOARD); return; }
      state.data.serviceOfferingId = state.data.offerings[idx].id; state.data.serviceOfferingName = state.data.offerings[idx].name;
      state.step = "zone"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.DEPLOY_ZONE(state.data.zones), CANCEL_KEYBOARD); return;
    }
    if (state.step === "zone") {
      const idx = parseInt(text, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= (state.data.zones || []).length) { bot.sendMessage(chatId, "Invalid selection. Reply with a number.", CANCEL_KEYBOARD); return; }
      state.data.zoneId = state.data.zones[idx].id; state.data.zoneName = state.data.zones[idx].name;
      state.step = "confirm"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.DEPLOY_CONFIRM(state.data.name, state.data.templateName, state.data.serviceOfferingName, state.data.zoneName), { parse_mode: "Markdown", ...CANCEL_KEYBOARD }); return;
    }
    if (state.step === "confirm") {
      const lower = text.toLowerCase();
      if (lower !== "yes" && lower !== "y") { clearState(chatId); bot.sendMessage(chatId, "Deployment cancelled.", REMOVE_KEYBOARD); sendMenu(chatId, session); return; }
      const { data: walletData, error: walletError, status: walletStatus } = await apiRequest("GET", "/api/wallet", chatId);
      if (walletError || !walletData?.success) {
        handleApiError(bot, chatId, walletError || "Failed to fetch wallet", walletStatus);
        clearState(chatId);
        sendMenu(chatId, session);
        return;
      }

      const currentBalance = Number(walletData.balance || 0);
      if (currentBalance < VM_DEPLOYMENT_COST) {
        clearState(chatId);
        bot.sendMessage(
          chatId,
          `Insufficient balance. You need $${VM_DEPLOYMENT_COST.toFixed(2)} to deploy a VM, but your balance is $${currentBalance.toFixed(2)}. Please top up first.`,
          { parse_mode: "Markdown", ...REMOVE_KEYBOARD }
        );
        sendMenu(chatId, session);
        return;
      }

      bot.sendMessage(chatId, MESSAGES.PROCESSING);
      const { data, error, status } = await apiRequest("POST", "/api/cloudstack/vms/deploy", chatId, {
        name: state.data.name,
        displayname: state.data.name,
        serviceofferingid: state.data.serviceOfferingId,
        serviceofferingname: state.data.serviceOfferingName,
        templateid: state.data.templateId,
        templatename: state.data.templateName,
        zoneid: state.data.zoneId,
        zonename: state.data.zoneName,
      });
      clearState(chatId);
      if (error) { handleApiError(bot, chatId, error, status); sendMenu(chatId, session); return; }

      const { error: debitError } = await apiRequest("POST", "/api/wallet/transaction", chatId, {
        amount: VM_DEPLOYMENT_COST,
        type: "debit",
        description: `VM Deployment: ${state.data.name}`,
      });
      if (debitError) {
        bot.sendMessage(
          chatId,
          `⚠️ VM deployed, but billing deduction failed: ${debitError}. Please check your wallet.`,
          { parse_mode: "Markdown" }
        );
      }

      bot.sendMessage(chatId, MESSAGES.DEPLOY_SUCCESS(data.vm?.cloudstackVmId || data.data?.id || data.vm?.id || "N/A"), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
      sendMenu(chatId, session);
    }
  }

  /* ── Top Up Flow — mirrors web exactly ── */
  async function handleTopupFlow(bot, chatId, text, state, session) {
    if (!session?.token) { clearState(chatId); bot.sendMessage(chatId, MESSAGES.NOT_LOGGED_IN, AUTH_MENU_KEYBOARD); return; }

    /* Step 1: Amount */
    if (state.step === "amount") {
      let amount; const choice = parseInt(text, 10);
      if (choice >= 1 && choice <= 6) amount = PRESET_AMOUNTS[choice - 1];
      else amount = parseFloat(text);
      if (isNaN(amount) || amount < 5) { bot.sendMessage(chatId, "Invalid amount. Select 1-6 or type custom (min $5).", CANCEL_KEYBOARD); return; }
      state.data.amount = amount; state.step = "method"; setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.TOPUP_METHOD(amount), { parse_mode: "Markdown", ...CANCEL_KEYBOARD }); return;
    }

    /* Step 2: Method */
    if (state.step === "method") {
      const choice = parseInt(text, 10);
      if (isNaN(choice) || choice < 1 || choice > PAYMENT_METHODS.length) { bot.sendMessage(chatId, "Invalid selection. Reply with a number.", CANCEL_KEYBOARD); return; }
      const method = PAYMENT_METHODS[choice - 1].id;
      const amount = state.data.amount;

      if (method === "crypto") {
        state.data.method = method;
        state.step = "crypto_xdc";
        setState(chatId, state);
        bot.sendMessage(chatId, MESSAGES.TOPUP_CRYPTO_AMOUNT, { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
        return;
      }

      bot.sendMessage(chatId, MESSAGES.PROCESSING);

      // Create transaction (mirrors web)
      const { data: txnData, error: txnError, status: txnStatus } = await createTransaction(chatId, amount, method);
      if (txnError || !txnData?.success) { handleApiError(bot, chatId, txnError || "Failed to create transaction", txnStatus); clearState(chatId); sendMenu(chatId, session); return; }
      const transactionId = txnData.transaction?.id;
      state.data.transactionId = transactionId; state.data.method = method;

      if (method === "upi") {
        const upiUrl = generateUPIUrl(amount);
        const scannerUrl = generateTopupPageLink(amount, "upi");
        
        // Send payment links to user
        bot.sendMessage(chatId, MESSAGES.TOPUP_UPI_LINK(amount, upiUrl), { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
        bot.sendMessage(chatId, `📷 *UPI Scanner*\n\nOpen the QR page here:\n[Open UPI Scanner](${scannerUrl})`, { parse_mode: "Markdown" });
        bot.sendMessage(chatId, "⏳ Processing your payment... Please wait.", { parse_mode: "Markdown" });

        // Auto-verify after 5 seconds (simulating payment completion)
        setTimeout(async () => {
          try {
            const { data: simData } = await simulateUPIPayment(chatId, "user@upi", amount);
            const providerTransactionId = simData?.payment?.paymentId || `upi_${Date.now()}`;
            
            const { data: verifyData, error: verifyError } = await verifyWalletTopup(
              chatId, transactionId, "SUCCESS", providerTransactionId, { method, initiatedVia: "telegram" }
            );
            
            if (verifyError || !verifyData?.success) {
              bot.sendMessage(chatId, MESSAGES.TOPUP_FAILED(verifyError || "Verification failed"), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            } else {
              bot.sendMessage(chatId, MESSAGES.TOPUP_SUCCESS(amount, verifyData.balance || amount), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            }
            sendMenu(chatId, getSession(chatId));
          } catch (err) {
            bot.sendMessage(chatId, MESSAGES.TOPUP_FAILED("Payment verification failed"), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            sendMenu(chatId, getSession(chatId));
          }
        }, 5000);
        
        clearState(chatId);
        return;
      }

      if (method === "razorpay") {
        const { data: orderData, error: orderError, status: orderStatus } = await createRazorpayOrder(chatId, amount, transactionId);
        if (orderError || !orderData?.success) { handleApiError(bot, chatId, orderError || "Failed to create order", orderStatus); clearState(chatId); sendMenu(chatId, session); return; }
        
        state.data.orderId = orderData.order?.id;
        state.data.transactionId = transactionId;
        const razorpayPageUrl = generateTopupPageLink(amount, "razorpay");
        
        // Send payment link to user
        bot.sendMessage(chatId, MESSAGES.TOPUP_RAZORPAY_LINK(amount, orderData.order?.id), { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
        bot.sendMessage(chatId, MESSAGES.TOPUP_RAZORPAY_PAGE(amount, razorpayPageUrl), { parse_mode: "Markdown" });
        bot.sendMessage(chatId, "⏳ Processing your payment... Please wait.", { parse_mode: "Markdown" });

        // Auto-verify after 8 seconds (simulating Razorpay payment completion)
        setTimeout(async () => {
          try {
            const providerTransactionId = `razorpay_${orderData.order?.id || Date.now()}`;
            
            const { data: verifyData, error: verifyError } = await verifyWalletTopup(
              chatId, transactionId, "SUCCESS", providerTransactionId, { method, initiatedVia: "telegram" }
            );
            
            if (verifyError || !verifyData?.success) {
              bot.sendMessage(chatId, MESSAGES.TOPUP_FAILED(verifyError || "Verification failed"), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            } else {
              bot.sendMessage(chatId, MESSAGES.TOPUP_SUCCESS(amount, verifyData.balance || amount), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            }
            sendMenu(chatId, getSession(chatId));
          } catch (err) {
            bot.sendMessage(chatId, MESSAGES.TOPUP_FAILED("Payment verification failed"), { parse_mode: "Markdown", ...REMOVE_KEYBOARD });
            sendMenu(chatId, getSession(chatId));
          }
        }, 8000);
        
        clearState(chatId);
        return;
      }

      if (method === "stripe") {
        const { data: sessionData, error: sessionError, status: sessionStatus } = await createStripeSession(chatId, amount, transactionId);
        if (sessionError || !sessionData?.success) { handleApiError(bot, chatId, sessionError || "Failed to create session", sessionStatus); clearState(chatId); sendMenu(chatId, session); return; }
        state.data.stripeSessionId = sessionData.sessionId; state.step = "confirm_payment"; setState(chatId, state);
        bot.sendMessage(chatId, MESSAGES.TOPUP_STRIPE_LINK(amount, sessionData.url), { parse_mode: "Markdown", ...CANCEL_KEYBOARD }); return;
      }
    }

    if (state.step === "crypto_xdc") {
      const xdcAmount = parseFloat(text);
      if (!Number.isFinite(xdcAmount) || xdcAmount <= 0) {
        bot.sendMessage(chatId, "Enter a valid XDC amount.", CANCEL_KEYBOARD);
        return;
      }
      state.data.xdcAmount = xdcAmount;
      state.step = "crypto_wallet";
      setState(chatId, state);
      bot.sendMessage(chatId, MESSAGES.TOPUP_CRYPTO_WALLET(xdcAmount), { parse_mode: "Markdown", ...CANCEL_KEYBOARD });
      return;
    }

    if (state.step === "crypto_wallet") {
      const walletAddress = text.trim();
      if (!walletAddress) {
        bot.sendMessage(chatId, "Enter a wallet address.", CANCEL_KEYBOARD);
        return;
      }

      state.data.walletAddress = walletAddress;
      const cryptoPageUrl = generateTopupPageLink(state.data.amount, "crypto") + `&xdcAmount=${encodeURIComponent(String(state.data.xdcAmount || ""))}&walletAddress=${encodeURIComponent(walletAddress)}`;
      clearState(chatId);
      
      // Note: Telegram URL buttons require HTTPS. For local development,
      // provide the link as text for the user to copy/paste
      bot.sendMessage(
        chatId,
        `₿ *Crypto Checkout Ready*\n\n` +
        `Amount: *$${state.data.amount}*\n` +
        `XDC to send: *${state.data.xdcAmount}*\n` +
        `Wallet: \`${walletAddress}\`\n\n` +
        `Open this link in your browser with MetaMask:\n` +
        `${cryptoPageUrl}\n\n` +
        `The page will have a "Connect Wallet & Pay" button to complete the transaction.`,
        { parse_mode: "Markdown", ...REMOVE_KEYBOARD }
      );
      sendMenu(chatId, session);
      return;
    }

    /* Step 3: Confirm payment - Auto-verified, no longer needed */
    if (state.step === "confirm_payment") {
      bot.sendMessage(chatId, "✅ Your payment is being processed automatically. You will receive a confirmation shortly.");
      clearState(chatId);
      sendMenu(chatId, session);
    }
  }

  /* ── Helpers ── */
  async function showAccount(bot, chatId, session) {
    const { data, error, status } = await apiRequest("GET", "/api/wallet", chatId);
    if (error) { handleApiError(bot, chatId, error, status); return; }
    bot.sendMessage(chatId, MESSAGES.ACCOUNT_INFO(session.name, session.email, data.balance || 0), { parse_mode: "Markdown" });
  }

  async function listVMs(bot, chatId, session) {
    const { data, error, status } = await apiRequest("GET", "/api/cloudstack/vms/list", chatId);
    if (error) { handleApiError(bot, chatId, error, status); return; }
    const vms = data.vms || [];
    if (vms.length === 0) { bot.sendMessage(chatId, MESSAGES.VM_LIST_EMPTY); return; }
    bot.sendMessage(chatId, MESSAGES.VM_LIST(vms), { parse_mode: "Markdown" });
  }

  async function showBalance(bot, chatId, session) {
    const { data, error, status } = await apiRequest("GET", "/api/wallet", chatId);
    if (error) { handleApiError(bot, chatId, error, status); return; }
    bot.sendMessage(chatId, `💰 Balance: *$${(data.balance || 0).toFixed(2)}*`, { parse_mode: "Markdown" });
  }
};
