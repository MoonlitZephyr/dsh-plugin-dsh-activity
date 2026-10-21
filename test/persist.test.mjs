// Behavioural harness for dsh-plugin-dsh-activity persistence.
// Reproduces the "only today's activity survives" bug: the host mounts `fs` /
// `sessionPersistence` AFTER the plugin's apply(), so an eager capture pinned
// `undefined` and persistence never resumed.
//
// Run: node test/persist.test.mjs   (or: pnpm test)
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pluginPath = process.argv[2]
  ?? fileURLToPath(new URL("../src/index.js", import.meta.url));

const home = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-home-"));
fs.mkdirSync(path.join(home, "storages"), { recursive: true });
process.env.DSH_HOME = home;
const usageFile = path.join(home, "storages", "dsh-activity-usage.json");

// old history that must survive a rewrite
fs.writeFileSync(usageFile, JSON.stringify({
  v: 1,
  hours: {},
  days: { "2026-09-10": { out: 111, inp: 222, calls: 3, turns: 1, steps: 0, tools: 0, skills: 0, maxMs: 0, models: {}, toolsMap: {}, skillsMap: {}, sessions: {} } },
}))

const fsService = {
  async resolve(p) { return { targetKey: p, displayPath: p } },
  async readText(target) { try { return fs.readFileSync(target.targetKey, "utf8") } catch { return undefined } },
  async writeText(target, content) { fs.writeFileSync(target.targetKey, content, "utf8"); return { operation: "update" } },
};

const handlers = new Map();
const intervals = [];
const services = { fs: undefined, sessionPersistence: undefined, llm: undefined, sessions: undefined, sessionTitle: undefined };
const ctx = {
  get: (name) => services[name],
  on: (event, handler) => { handlers.set(event, handler); return () => {}; },
  interval: (fn, ms) => { intervals.push(fn); return () => {}; },
  effect: (fn) => fn(),
  webServer: { register: () => () => {} },
  logger: { warn() {}, error() {}, info() {} },
};

const plugin = require(pluginPath);
plugin.apply(ctx);
assert.ok(handlers.has("llm/stream"), "registers the llm/stream waterfall");

// services arrive later, exactly like the 0.2.x composition
services.fs = fsService;

// one model call
const stream = handlers.get("llm/stream")({ sessionId: "s1", provider: "deepseek-account", model: "agnes-3.0-flash" },
  async function* () { yield { type: "usage", usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 0 } }; });
for await (const _chunk of stream) { /* drain */ }

// the periodic flusher would do this after 20s
for (const fn of intervals) fn();
await new Promise((resolve) => setTimeout(resolve, 250));

assert.ok(fs.existsSync(usageFile), "usage file written");
const saved = JSON.parse(fs.readFileSync(usageFile, "utf8"));
const today = new Date();
const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

assert.ok(saved.days[key], `today (${key}) recorded`);
assert.equal(saved.days[key].out, 200, "today output tokens persisted");
assert.ok(saved.days["2026-09-10"], "old history merged back (not overwritten)");
assert.equal(saved.days["2026-09-10"].out, 111, "old history values intact");
console.log(`ok   wrote ${path.basename(usageFile)}: today=${key} out=200, history 2026-09-10 kept`);

fs.rmSync(home, { recursive: true, force: true });
console.log("\n1/1 passed");
