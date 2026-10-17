import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig(
  runtime?: { apiUrl?: string; wsUrl?: string },
  env: Record<string, string> = {}
) {
  vi.resetModules();
  vi.stubGlobal("window", runtime ? { __OPEN_SUNSAMA_CONFIG__: runtime } : {});
  vi.stubEnv("VITE_API_URL", env.VITE_API_URL ?? "");
  vi.stubEnv("VITE_WS_URL", env.VITE_WS_URL ?? "");
  return import("./config");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("config", () => {
  it("defaults to localhost", async () => {
    const config = await loadConfig();
    expect(config.CONFIGURED_API_URL).toBeUndefined();
    expect(config.API_URL).toBe("http://localhost:3001");
    expect(config.WS_URL).toBe("ws://localhost:3001");
  });

  it("uses the build-time URLs", async () => {
    const config = await loadConfig(undefined, {
      VITE_API_URL: "https://api.example.com",
      VITE_WS_URL: "wss://ws.example.com",
    });
    expect(config.API_URL).toBe("https://api.example.com");
    expect(config.WS_URL).toBe("wss://ws.example.com");
  });

  it("derives the WebSocket URL from the build-time API URL", async () => {
    const config = await loadConfig(undefined, {
      VITE_API_URL: "https://api.example.com",
    });
    expect(config.WS_URL).toBe("wss://api.example.com");
  });

  it("prefers the runtime config over build-time URLs", async () => {
    const config = await loadConfig(
      { apiUrl: "https://tasks.example.org" },
      {
        VITE_API_URL: "https://api.example.com",
        VITE_WS_URL: "wss://api.example.com",
      }
    );
    expect(config.CONFIGURED_API_URL).toBe("https://tasks.example.org");
    expect(config.WS_URL).toBe("wss://tasks.example.org");
  });

  it("uses a runtime WebSocket URL when given", async () => {
    const config = await loadConfig({
      apiUrl: "http://10.0.0.5:3001",
      wsUrl: "ws://10.0.0.5:3002",
    });
    expect(config.API_URL).toBe("http://10.0.0.5:3001");
    expect(config.WS_URL).toBe("ws://10.0.0.5:3002");
  });

  it("ignores an empty runtime config", async () => {
    const config = await loadConfig(
      {},
      { VITE_API_URL: "https://api.example.com" }
    );
    expect(config.API_URL).toBe("https://api.example.com");
  });
});
