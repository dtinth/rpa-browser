#!/usr/bin/env node
import puppeteer from "puppeteer";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const [command, profile] = process.argv.slice(2);

if (!command || !profile) {
  console.error("Usage: rpa-browser <daemon|ws-endpoint> <profile-name>");
  process.exit(1);
}

function profileDir(name: string) {
  return join(homedir(), ".local", "share", "rpa-browser", name);
}

function stateFile(name: string) {
  return join(profileDir(name), "state.json");
}

if (command === "daemon") {
  const dir = profileDir(profile);
  await mkdir(dir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: join(dir, "profile"),
  });

  const state = { pid: process.pid, wsEndpoint: browser.wsEndpoint() };
  await writeFile(stateFile(profile), JSON.stringify(state));

  console.log(`Browser running. wsEndpoint: ${state.wsEndpoint}`);

  const cleanup = async () => {
    await unlink(stateFile(profile)).catch(() => {});
    await browser.close().catch(() => {});
  };

  browser.on("disconnected", async () => {
    await cleanup();
    process.exit(0);
  });

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
} else if (command === "ws-endpoint") {
  const raw = await readFile(stateFile(profile), "utf-8").catch(() => null);
  if (!raw) {
    console.error(`No running daemon found for profile: ${profile}`);
    process.exit(1);
  }
  const { wsEndpoint } = JSON.parse(raw);
  console.log(wsEndpoint);
} else {
  console.error(`Unknown command: ${command}`);
  console.error("Usage: rpa-browser <daemon|ws-endpoint> <profile-name>");
  process.exit(1);
}
