/**
 * Where the web app finds the API.
 *
 * Each value is read from, in order:
 * 1. window.__OPEN_SUNSAMA_CONFIG__, set by /config.js before the app loads.
 *    The Docker image's server.ts writes it from the API_URL and WS_URL
 *    environment variables, so one published image works for any server.
 * 2. VITE_API_URL / VITE_WS_URL, baked in at build time (desktop, hosted site).
 * 3. Localhost defaults for development.
 *
 * public/config.js is a no-op, so dev, e2e and desktop builds skip step 1.
 */

export interface RuntimeConfig {
  apiUrl?: string;
  wsUrl?: string;
}

declare global {
  interface Window {
    __OPEN_SUNSAMA_CONFIG__?: RuntimeConfig;
  }
}

const runtime: RuntimeConfig =
  (typeof window !== "undefined" && window.__OPEN_SUNSAMA_CONFIG__) || {};

/** http→ws, https→wss */
const toWebSocketUrl = (url: string) => url.replace(/^http/, "ws");

/**
 * The API URL set at runtime or build time, or undefined when neither is.
 * For callers whose default is not localhost.
 */
export const CONFIGURED_API_URL: string | undefined =
  runtime.apiUrl || import.meta.env.VITE_API_URL || undefined;

export const API_URL = CONFIGURED_API_URL || "http://localhost:3001";

// A runtime apiUrl wins over a baked-in VITE_WS_URL, so self-hosters only set API_URL
export const WS_URL =
  runtime.wsUrl ||
  (runtime.apiUrl
    ? toWebSocketUrl(runtime.apiUrl)
    : import.meta.env.VITE_WS_URL || toWebSocketUrl(API_URL));
