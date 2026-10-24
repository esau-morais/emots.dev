// Real desktop Chrome headless at real window sizes, opens the lightbox and reports the image box.
import { spawn } from "node:child_process";
import fs from "node:fs";
const out = [];
for (const [w, h] of [[1280, 800], [1920, 1080], [932, 334], [594, 406], [1024, 400]]) {
  const p = 9300 + out.length, dir = `/tmp/duo-verify/chrome-profile-${p}`;
  const proc = spawn("google-chrome", ["--headless=new", `--remote-debugging-port=${p}`, `--user-data-dir=${dir}`, `--window-size=${w},${h}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  let list; for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://localhost:${p}/json`)).json(); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
  const ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl); let id = 0; const pend = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); pend.get(d.id)?.(d); };
  await new Promise(r => ws.onopen = r);
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.navigate", { url: "http://localhost:4173/work/edite" }); await new Promise(r => setTimeout(r, 3000));
  const v = (await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async()=>{const t=document.querySelector('[aria-label^="View "][role=button]');t.scrollIntoView({block:"center"});t.click();await new Promise(r=>setTimeout(r,1500));const d=document.querySelector("[role=dialog][aria-modal=true]");const s=d.querySelector("img").parentElement.getBoundingClientRect(),i=d.querySelector("img").getBoundingClientRect();return {vp:[innerWidth,innerHeight],v2:matchMedia("(vertical-viewport-segments: 2)").matches,h2:matchMedia("(horizontal-viewport-segments: 2)").matches,maxH:getComputedStyle(d.querySelector("img")).maxHeight,img:[i.width,i.height],span:[s.width,s.height],hiddenPx:i.height-(s.height-2),cap90vh:innerHeight*0.9}})()` })).result.result.value;
  out.push(v); console.log(JSON.stringify(v));
  ws.close(); proc.kill(); await new Promise(r => setTimeout(r, 300)); fs.rmSync(dir, { recursive: true, force: true });
}
fs.writeFileSync("/tmp/duo-verify/raw-desktop-lightbox-after-fix.json", JSON.stringify(out, null, 1));
