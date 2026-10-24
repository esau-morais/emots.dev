// Real Chrome 145 on the Android emulator: viewport 669x902 @3x with a real horizontal fold
// (vertical-viewport-segments: 2) at y=426. Opens the lightbox in dark mode, saves the viewport.
import fs from "node:fs";
const OUT = "/tmp/duo-verify/mock/cap";
fs.mkdirSync(OUT, { recursive: true });
const list = await (await fetch("http://localhost:9222/json")).json();
const ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl); let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); pend.get(d.id)?.(d); };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.result.value;
const report = {};
for (const [name, port] of [["main", 4176], ["branch", 4173]]) {
  await send("Page.navigate", { url: `http://localhost:${port}/work/edite` }); await new Promise(r => setTimeout(r, 4000));
  await ev(`(async()=>{ if(!document.documentElement.classList.contains('dark')){ document.querySelector('header button[aria-label]')?.click(); await new Promise(r=>setTimeout(r,800)); } return document.documentElement.className })()`);
  const m = await ev(`(async()=>{const t=document.querySelector('[aria-label^="View "][role=button]');t.scrollIntoView({block:"center"});await new Promise(r=>setTimeout(r,400));t.click();await new Promise(r=>setTimeout(r,1800));const d=document.querySelector("[role=dialog][aria-modal=true]");const s=d.querySelector("img").parentElement.getBoundingClientRect(),i=d.querySelector("img").getBoundingClientRect(),seg=viewport.segments;return {vp:[innerWidth,innerHeight],dpr:devicePixelRatio,theme:document.documentElement.className,v2:matchMedia("(vertical-viewport-segments: 2)").matches,segs:seg.map(x=>[x.x,x.y,x.width,x.height]),foldTop:seg.length===2?seg[0].y+seg[0].height:null,frame:[s.left,s.top,s.right,s.bottom],img:[i.left,i.top,i.right,i.bottom],hiddenPx:i.height-(s.height-2),onTopSegment:seg.length===2?s.bottom<=seg[0].y+seg[0].height:null}})()`);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${OUT}/laptop-${name}.png`, Buffer.from(shot.result.data, "base64"));
  report[name] = m; console.log(name, JSON.stringify(m));
}
fs.writeFileSync("/tmp/duo-verify/raw-mock-laptop.json", JSON.stringify(report, null, 1));
ws.close();
