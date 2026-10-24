(async () => {
  let d = document.querySelector("[role=dialog][aria-modal=true]");
  if (!d) { const t = document.querySelector('[aria-label^="View "][role=button]'); t.scrollIntoView({ block: "center" }); t.click(); await new Promise(r => setTimeout(r, 1500)); d = document.querySelector("[role=dialog][aria-modal=true]"); }
  const b = d.querySelector("img").parentElement.getBoundingClientRect(), r = d.getBoundingClientRect(), cs = getComputedStyle(d);
  const s = viewport.segments; const p = document.createElement("div"); p.style.cssText = "position:fixed;height:100dvh"; document.body.append(p); const dvh = p.getBoundingClientRect().height; p.remove();
  const foldTop = s.length === 2 ? s[0].y + s[0].height : null;
  return { v2: matchMedia("(vertical-viewport-segments: 2)").matches, h2: matchMedia("(horizontal-viewport-segments: 2)").matches, segs: s.map(x => [x.x, x.y, x.width, x.height]), foldTop, foldBottom: s[1]?.y ?? null,
    viewport: [innerWidth, innerHeight], dvh, dialog: { top: r.top, bottom: r.bottom, pt: cs.paddingTop, pb: cs.paddingBottom, pr: cs.paddingRight },
    img: { left: b.left, top: b.top, right: b.right, bottom: b.bottom }, onTopSegment: foldTop != null ? b.bottom <= foldTop : null };
})()
