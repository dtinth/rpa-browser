# rpa-browser

A persistent browser daemon using Puppeteer, designed for RPA (robotic process automation) workflows. Launches a browser with a named profile and exposes its WebSocket endpoint so other tools can connect to it.

## Usage

```sh
# Start a browser daemon with a named profile
rpa-browser daemon <profile-name>

# In another tab: get the WebSocket endpoint of a running daemon
rpa-browser ws-endpoint <profile-name>
```

## How it works

- `daemon` — launches a Puppeteer browser (non-headless) with a persistent user data directory stored at `~/.local/share/rpa-browser/<profile>/profile`. Writes the WebSocket endpoint to a state file and keeps running until the browser is closed.
- `ws-endpoint` — reads the state file and prints the WebSocket endpoint, so other scripts can connect to the running browser via CDP [or Playwright](https://dt.in.th/SemiAutomatedRPAPuppeteerPlaywright).

## Requirements

- Node.js 24+
