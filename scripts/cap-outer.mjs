// Real desktop Chrome, real 594x406 viewport (window sized, no Emulation.*), dpr 2 via launch flag.
// Opens the lightbox on /work/edite in dark mode and saves the viewport for main (:4176) and the branch (:4173).
import { spawn } from "node:child_process";
import fs from "node:fs";
const OUT = "/tmp/duo-verify/mock/cap";
fs.mkdirSync(OUT, { recursive: true });
const p = 9611, dir = `/tmp/duo-verify/chrome-profile-${p}`;
let winH = 406 + 87;
const proc = spawn("google-chrome", ["--headless=new", `--remote-debugging-port=${p}`, `--user-data-dir=${dir}`, `--window-size=594,${winH}`, "--force-device-scale-factor=2", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://localhost:${p}/json`)).json(); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
const ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl); let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); pend.get(d.id)?.(d); };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.result.value;
const { windowId } = (await send("Browser.getWindowForTarget")).result;
const report = {};
for (const [name, port] of [["main", 4176], ["branch", 4173]]) {
  await send("Page.navigate", { url: `http://localhost:${port}/work/edite` }); await new Promise(r => setTimeout(r, 2500));
  // fit the real window so the viewport is exactly 594x406
  for (let i = 0; i < 3; i++) {
    const [w, h] = await ev("[innerWidth, innerHeight]");
    if (w === 594 && h === 406) break;
    const b = (await send("Browser.getWindowBounds", { windowId })).result.bounds;
    await send("Browser.setWindowBounds", { windowId, bounds: { width: b.width + (594 - w), height: b.height + (406 - h) } });
    await new Promise(r => setTimeout(r, 500));
  }
  await ev(`(async()=>{ if(!document.documentElement.classList.contains('dark')&&document.documentElement.classList.contains('light')){} const b=document.querySelector('button[aria-label*="dark mode"]'); if(b) b.click(); await new Promise(r=>setTimeout(r,600)); return 1 })()`);
  const m = await ev(`(async()=>{const t=document.querySelector('[aria-label^="View "][role=button]');t.scrollIntoView({block:"center"});await new Promise(r=>setTimeout(r,300));t.click();await new Promise(r=>setTimeout(r,1800));const d=document.querySelector("[role=dialog][aria-modal=true]");const s=d.querySelector("img").parentElement.getBoundingClientRect(),i=d.querySelector("img").getBoundingClientRect();return {vp:[innerWidth,innerHeight],dpr:devicePixelRatio,theme:document.documentElement.className,span:[s.left,s.top,s.right,s.bottom],img:[i.left,i.top,i.right,i.bottom],hiddenPx:i.height-(s.height-2),segs:window.viewport?.segments?.length??null}})()`);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${OUT}/outer-landscape-${name}.png`, Buffer.from(shot.result.data, "base64"));
  report[name] = m; console.log(name, JSON.stringify(m));
}
fs.writeFileSync("/tmp/duo-verify/raw-mock-outer-landscape.json", JSON.stringify(report, null, 1));
ws.close(); proc.kill(); setTimeout(() => fs.rmSync(dir, { recursive: true, force: true }), 500);
