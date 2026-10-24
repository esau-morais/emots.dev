// render.mjs <out.png> <query> : screenshots mock/duo.html at 1920x1080 @2x in headless Chrome
import { spawn } from "node:child_process";
import fs from "node:fs";
const [out, query] = process.argv.slice(2);
const p = 9700 + Math.floor(Math.random() * 200), dir = `/tmp/duo-verify/chrome-profile-${p}`;
const proc = spawn("google-chrome", ["--headless=new", `--remote-debugging-port=${p}`, `--user-data-dir=${dir}`, "--window-size=1920,1080", "--force-device-scale-factor=2", "--hide-scrollbars", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://localhost:${p}/json`)).json(); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
const ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl); let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); pend.get(d.id)?.(d); };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const { windowId } = (await send("Browser.getWindowForTarget")).result;
await send("Page.navigate", { url: `file:///tmp/duo-verify/mock/duo.html?${query}` });
await new Promise(r => setTimeout(r, 1500));
const [w, h] = (await send("Runtime.evaluate", { expression: "[innerWidth, innerHeight, document.body.dataset.ready]", returnByValue: true })).result.result.value;
if (w !== 1920 || h !== 1080) {
  const b = (await send("Browser.getWindowBounds", { windowId })).result.bounds;
  await send("Browser.setWindowBounds", { windowId, bounds: { width: b.width + 1920 - w, height: b.height + 1080 - h } });
  await new Promise(r => setTimeout(r, 800));
}
const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
ws.close(); proc.kill(); setTimeout(() => fs.rmSync(dir, { recursive: true, force: true }), 500);
