/**
 * bot/lib/session.js
 * ------------------
 * In-memory session store for the Telegram bot.
 * Maps Telegram chat IDs to their auth tokens so authenticated
 * API calls can include Authorization: Bearer *** headers.
 *
 * Also tracks conversation state per chat_id for the state machine.
 */

const axios = require("axios");

function normalizeBaseUrl(value) {
  // Strip surrounding whitespace, trailing slashes AND trailing dots
  // A trailing dot (e.g. "example.com.") causes TLS handshake failures
  // because the SSL certificate won't match the fully-qualified domain name.
  const raw = (value || "").trim().replace(/[./]+$/, "");
  if (!raw) {
    return "https://telecloud-x-hiv7-rutujapalye12-9049s-projects.vercel.app";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

const NORMALIZED_BASE_URL = normalizeBaseUrl(process.env.BOT_WEB_BASE_URL);
/**
 * Map<telegramId, { token: string, email: string, name: string, userId: string }>
 * Stores auth tokens per Telegram user ID.
 */
const sessions = new Map();

/**
 * Map<chatId, { flow: string, step: string, data: object, lastActivity: number }>
 * Tracks conversation state for the state machine.
 */
const conversationStates = new Map();

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get the stored session for a Telegram user.
 */
function getSession(telegramId) {
  return sessions.get(telegramId);
}

/**
 * Store an auth session for a Telegram user.
 */
function setSession(telegramId, session) {
  sessions.set(telegramId, session);
}

/**
 * Clear the auth session for a Telegram user.
 */
function clearSession(telegramId) {
  sessions.delete(telegramId);
}

/**
 * Get conversation state for a chat.
 */
function getState(chatId) {
  return conversationStates.get(chatId);
}

/**
 * Set conversation state for a chat.
 */
function setState(chatId, state) {
  conversationStates.set(chatId, {
    ...state,
    lastActivity: Date.now(),
  });
}

/**
 * Clear conversation state for a chat.
 */
function clearState(chatId) {
  conversationStates.delete(chatId);
}

/**
 * Check if a conversation has expired due to idle timeout.
 */
function isExpired(chatId) {
  const state = conversationStates.get(chatId);
  if (!state) return false;
  return Date.now() - state.lastActivity > IDLE_TIMEOUT_MS;
}

/**
 * Clean up expired sessions (can be called periodically).
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [chatId, state] of conversationStates.entries()) {
    if (now - state.lastActivity > IDLE_TIMEOUT_MS) {
      conversationStates.delete(chatId);
    }
  }
}

/**
 * Build axios config with Authorization header if session exists.
 */
function authHeaders(telegramId) {
  const session = getSession(telegramId);
  if (!session || !session.token) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  };
}

/**
 * Helper to make authenticated API requests.
 * Returns { data, error } so callers can handle errors cleanly.
 */
async function apiRequest(method, path, telegramId, data = null) {
  try {
    const config = {
      method,
      url: `${NORMALIZED_BASE_URL}${path}`,
      ...authHeaders(telegramId),
    };
    if (data) {
      config.data = data;
    }
    const response = await axios(config);
    return { data: response.data, error: null };
  } catch (err) {
    const status = err.response?.status;
    const errorMessage = err.response?.data?.error || err.message || "Request failed";
    return { data: null, error: errorMessage, status };
  }
}

module.exports = {
  getSession,
  setSession,
  clearSession,
  getState,
  setState,
  clearState,
  isExpired,
  cleanupExpired,
  authHeaders,
  apiRequest,
  BASE_URL: NORMALIZED_BASE_URL,
};
