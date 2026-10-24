// usage: node cdp.mjs <port> <expression-file|-e expr> ; prints result value as JSON
import fs from "node:fs";
const [port, a, b] = process.argv.slice(2);
const expr = a === "-e" ? b : fs.readFileSync(a, "utf8");
const list = await (await fetch(`http://localhost:${port}/json`)).json();
const page = list.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => (ws.onopen = r));
const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
if (res.result?.exceptionDetails) { console.error(JSON.stringify(res.result.exceptionDetails, null, 1)); process.exit(1); }
console.log(JSON.stringify(res.result?.result?.value ?? res, null, 1));
ws.close();
