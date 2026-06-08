/**
 * bot/lib/messages.js
 * -------------------
 * Centralized message templates and keyboard builders.
 */

const MAIN_MENU_KEYBOARD = {
  reply_markup: {
    keyboard: [
      ["🚀 Deploy VM", "💰 Top Up Balance"],
      ["👤 My Account", "🚪 Logout"],
    ],
    resize_keyboard: true,
  },
};

const AUTH_MENU_KEYBOARD = {
  reply_markup: {
    keyboard: [
      ["🔑 Login", "📝 Register"],
      ["❓ Help"],
    ],
    resize_keyboard: true,
  },
};

const CANCEL_KEYBOARD = {
  reply_markup: {
    keyboard: [["/cancel"]],
    resize_keyboard: true,
  },
};

const REMOVE_KEYBOARD = {
  reply_markup: {
    remove_keyboard: true,
  },
};

const MESSAGES = {
  WELCOME:
    "☁️ *Welcome to TelecloudX!*\n\n" +
    "Your cloud VM management bot.\n\n" +
    "What would you like to do?",

  WELCOME_LINKED: (name) =>
    `☁️ *Welcome back to TelecloudX, ${name}!*\n\n` +
    `Your Telegram is linked. What would you like to do?`,

  AUTH_MENU:
    "🔐 *Authentication Menu*\n\n" +
    "Please choose an option:",

  MAIN_MENU:
    "📋 *Main Menu*\n\n" +
    "Choose an action:",

  LOGIN_EMAIL: "🔑 *Login*\n\nPlease enter your email address:",
  LOGIN_PASSWORD: "🔒 Please enter your password:",
  LOGIN_SUCCESS: (name) => `✅ Welcome back, *${name}*!\n\nYou are now logged in.`,
  LOGIN_FAILED: "❌ Invalid email or password.\n\nPlease try again or use /cancel to go back.",
  LOGIN_MAX_RETRIES: "❌ Too many failed attempts.\n\nPlease try again later or use /register to create a new account.",

  REGISTER_NAME: "📝 *Register*\n\nLet's create your account.\n\nPlease enter your full name:",
  REGISTER_EMAIL: "📧 Please enter your email address:",
  REGISTER_PASSWORD: "🔒 Please create a password (min 6 characters):",
  REGISTER_CONFIRM: "🔒 Please confirm your password:",
  REGISTER_PASSWORD_MISMATCH: "❌ Passwords do not match.\n\nPlease enter your password again:",
  REGISTER_PASSWORD_SHORT: "❌ Password must be at least 6 characters.\n\nPlease enter a stronger password:",
  REGISTER_EMAIL_EXISTS: "❌ An account with this email already exists.\n\nUse /login to sign in, or /cancel to go back.",
  REGISTER_SUCCESS: (name) => `✅ Account created successfully, *${name}*!\n\nYou are now logged in.`,
  REGISTER_FAILED: (error) => `❌ Registration failed: ${error}\n\nPlease try again or use /cancel.`,

  LOGOUT_SUCCESS: "👋 You have been logged out successfully.",
  NOT_LOGGED_IN: "❌ You are not logged in.\n\nUse /login or /register to continue.",

  DEPLOY_NAME: "🚀 *Deploy VM*\n\nStep 1/4: What should we name this VM?",
  DEPLOY_TEMPLATE: (templates) => {
    let msg = "📀 Step 2/4: Select a template:\n\n";
    templates.forEach((t, i) => {
      msg += `${i + 1}. ${t.name} (${t.ostypename})\n`;
    });
    msg += "\nReply with the number.";
    return msg;
  },
  DEPLOY_OFFERING: (offerings) => {
    let msg = "⚡ Step 3/4: Select a service offering:\n\n";
    offerings.forEach((o, i) => {
      msg += `${i + 1}. ${o.name} — ${o.cpunumber} CPU / ${(o.memory / 1024).toFixed(1)} GB RAM\n`;
    });
    msg += "\nReply with the number.";
    return msg;
  },
  DEPLOY_ZONE: (zones) => {
    let msg = "🌍 Step 4/4: Select a zone:\n\n";
    zones.forEach((z, i) => {
      msg += `${i + 1}. ${z.name} (${z.networktype})\n`;
    });
    msg += "\nReply with the number.";
    return msg;
  },
  DEPLOY_CONFIRM: (name, template, offering, zone) =>
    `🚀 *Deploy VM Confirmation*\n\n` +
    `Name: *${name}*\n` +
    `Template: *${template}*\n` +
    `Offering: *${offering}*\n` +
    `Zone: *${zone}*\n\n` +
    `Type "yes" to confirm or /cancel to abort.`,
  DEPLOY_SUCCESS: (vmId) => `✅ VM deployment initiated!\n\nVM ID: \`${vmId}\``,
  DEPLOY_FAILED: (error) => `❌ Deployment failed: ${error}`,

  // ── Top Up Flow ──
  TOPUP_AMOUNT:
    "💰 *Top Up Balance*\n\n" +
    "Select an amount:\n\n" +
    "1. $10\n" +
    "2. $25\n" +
    "3. $50\n" +
    "4. $100\n" +
    "5. $250\n" +
    "6. $500\n\n" +
    "Reply with a number (1-6), or type a custom amount (min $5).",

  TOPUP_METHOD: (amount) =>
    `💳 *Top Up $${amount}*\n\n` +
    `Select payment method:\n\n` +
    `1. 📱 UPI — Pay via any UPI app\n` +
    `2. 💳 Razorpay — Cards, UPI, Netbanking\n` +
    `3. ₿ Crypto — Pay with XDC via MetaMask\n` +
    `4. 🌍 Stripe — International cards\n\n` +
    `Reply with the number.`,

  TOPUP_UPI_LINK: (amount, url) =>
    `📱 *UPI Payment — $${amount}*\n\n` +
    `Click the link below to pay via your UPI app:\n` +
    `[Pay $${amount} via UPI](${url})\n\n` +
    `After paying, reply with *"done"* to confirm.`,

  TOPUP_RAZORPAY_LINK: (amount, orderId) =>
    `💳 *Razorpay Payment — $${amount}*\n\n` +
    `Order ID: \`${orderId}\`\n\n` +
    `Please complete your payment using the Razorpay checkout.\n` +
    `After paying, reply with *"done"* to confirm.`,

  TOPUP_RAZORPAY_PAGE: (amount, url) =>
    `💳 *Razorpay Checkout — $${amount}*\n\n` +
    `Open the checkout page below:\n` +
    `[Pay $${amount} with Razorpay](${url})\n\n` +
    `After paying, reply with *"done"* to confirm.`,

  TOPUP_STRIPE_LINK: (amount, url) =>
    `🌍 *Stripe Payment — $${amount}*\n\n` +
    `Click the secure checkout link below:\n` +
    `[Pay $${amount} via Stripe](${url})\n\n` +
    `After paying, reply with *"done"* to confirm.`,

  TOPUP_CRYPTO_AMOUNT: "₿ *Crypto Top Up*\n\nHow many XDC do you want to send?",
  TOPUP_CRYPTO_WALLET: (xdcAmount) =>
    `📨 *Wallet Address*\n\n` +
    `Enter your wallet address so we can prefill the Crypto checkout.\n` +
    `XDC amount selected: *${xdcAmount}*\n\n` +
    `Then we’ll open the MetaMask checkout page.`,
  TOPUP_CRYPTO_LINK: (url) =>
    `₿ *Open Crypto Checkout*\n\n` +
    `Continue in your browser to connect MetaMask and complete the XDC transfer:\n` +
    `[Open Crypto Top Up](${url})`,

  TOPUP_CONFIRM_PROMPT:
    "⏳ Waiting for payment confirmation...\n\n" +
    "Reply with *\"done\"* once you've completed the payment, " +
    "or *\"cancel\"* to abort.",

  TOPUP_VERIFYING: "🔍 Verifying your payment...",

  TOPUP_SUCCESS: (amount, balance) =>
    `✅ *Payment Successful!*\n\n` +
    `Added $${amount} to your wallet.\n` +
    `New balance: *$${balance.toFixed(2)}*`,

  TOPUP_FAILED: (error) =>
    `❌ *Payment Failed*\n\n` +
    `${error}\n\n` +
    `Your wallet has not been charged. Please try again.`,

  TOPUP_CANCELLED: "❌ Top-up cancelled. No charges were made.",

  ACCOUNT_INFO: (name, email, balance) =>
    `👤 *My Account*\n\n` +
    `Name: *${name}*\n` +
    `Email: \`${email}\`\n` +
    `Balance: *$${balance.toFixed(2)}*`,

  VM_LIST_EMPTY: "📭 You have no VMs.\n\nUse 🚀 Deploy VM to create one.",
  VM_LIST: (vms) => {
    let msg = "🖥️ *Your VMs:*\n\n";
    vms.forEach((vm, i) => {
      msg += `${i + 1}. *${vm.displayname || vm.name}*\n`;
      msg += `   ID: \`${vm.id}\`\n`;
      msg += `   Status: ${vm.state}\n`;
      msg += `   Template: ${vm.templatename || "N/A"}\n`;
      msg += `   Specs: ${vm.cpunumber || "?"} CPU / ${vm.memory ? (vm.memory / 1024).toFixed(1) : "?"} GB\n\n`;
    });
    return msg;
  },

  HELP:
    "📖 *TelecloudX Bot Help*\n\n" +
    "*Main Menu Commands:*\n" +
    "🚀 Deploy VM — Start VM deployment\n" +
    "💰 Top Up Balance — Add credits to wallet\n" +
    "👤 My Account — View profile and balance\n" +
    "🚪 Logout — Sign out\n\n" +
    "*Power User Shortcuts:*\n" +
    "/deploy — Quick deploy VM\n" +
    "/topup — Quick top-up\n" +
    "/account — View account\n" +
    "/list — List your VMs\n" +
    "/balance — Check wallet balance\n\n" +
    "*Other Commands:*\n" +
    "/start — Welcome / Auth menu\n" +
    "/cancel — Cancel current operation\n" +
    "/help — Show this message",

  CANCELLED: "❌ Operation cancelled. Returning to menu.",
  EXPIRED: "⏰ Your session has expired due to inactivity. Please start again.",
  INVALID_INPUT: "❓ I didn't understand that.\n\nPlease choose from the available options, or use /help for assistance.",
  PROCESSING: "⏳ Processing... Please wait.",
  ERROR: "⚠️ Something went wrong. Please try again or contact support.",
};

module.exports = {
  MESSAGES,
  MAIN_MENU_KEYBOARD,
  AUTH_MENU_KEYBOARD,
  CANCEL_KEYBOARD,
  REMOVE_KEYBOARD,
};
