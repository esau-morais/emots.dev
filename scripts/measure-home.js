(() => {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;" +
    "margin-left:env(viewport-segment-right 0 0, -1px);" +
    "margin-top:env(viewport-segment-left 1 0, -1px);" +
    "padding-left:env(safe-area-inset-left, -1px);padding-right:env(safe-area-inset-right, -1px);" +
    "padding-top:env(safe-area-inset-top, -1px);padding-bottom:env(safe-area-inset-bottom, -1px);";
  document.body.appendChild(probe);
  const ps = getComputedStyle(probe);
  const env = {
    "viewport-segment-right 0 0": ps.marginLeft,
    "viewport-segment-left 1 0": ps.marginTop,
    safeArea: { t: ps.paddingTop, r: ps.paddingRight, b: ps.paddingBottom, l: ps.paddingLeft },
  };
  probe.remove();
  const root = getComputedStyle(document.documentElement);
  const vars = Object.fromEntries(["--fold-x","--fold-w","--gutter","--gutter-left","--gutter-right","--safe-left","--safe-right"].map(v => [v, root.getPropertyValue(v).trim()]));
  // resolve --fold-x / --fold-w to px via a probe
  const p2 = document.createElement("div");
  p2.style.cssText = "position:fixed;visibility:hidden;width:var(--fold-x);height:var(--fold-w);padding-left:var(--gutter-left);padding-right:var(--gutter-right)";
  document.body.appendChild(p2);
  const c2 = getComputedStyle(p2);
  const resolved = { foldX: c2.width, foldW: c2.height, gutterLeft: c2.paddingLeft, gutterRight: c2.paddingRight };
  p2.remove();
  const hr = document.querySelector("section hr");
  const section = hr?.closest("section");
  const cols = section ? [...section.children].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, left: r.left, right: r.right, width: r.width }; }) : null;
  const hrRect = hr?.getBoundingClientRect();
  const sc = section && getComputedStyle(section);
  const segs = window.viewport?.segments?.map(s => ({ x: s.x, y: s.y, w: s.width, h: s.height })) ?? null;
  const foldStart = segs && segs.length === 2 ? segs[0].x + segs[0].w : null;
  const foldEnd = segs && segs.length === 2 ? segs[1].x : null;
  const foldMid = foldStart != null ? (foldStart + foldEnd) / 2 : null;
  const featured = [...document.querySelectorAll("ul")].find(u => /grid-cols-3/.test(u.className) && u.querySelector("a"));
  return {
    viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, vv: visualViewport && { w: visualViewport.width, h: visualViewport.height } },
    mq: { h2: matchMedia("(horizontal-viewport-segments: 2)").matches, v2: matchMedia("(vertical-viewport-segments: 2)").matches, h1: matchMedia("(horizontal-viewport-segments: 1)").matches },
    posture: navigator.devicePosture?.type ?? null,
    segments: segs, foldStart, foldEnd, foldMid,
    env, vars, resolved,
    section: section && { className: section.className, width: section.getBoundingClientRect().width, left: section.getBoundingClientRect().left, gridTemplateColumns: sc.gridTemplateColumns, columnGap: sc.columnGap },
    containerWidth: section?.parentElement.getBoundingClientRect().width,
    hr: hrRect && { left: hrRect.left, width: hrRect.width, centre: hrRect.left + hrRect.width / 2, display: getComputedStyle(hr).display },
    hairlineMinusFoldMid: hrRect && foldMid != null ? hrRect.left + hrRect.width / 2 - foldMid : null,
    cols,
    colClearance: cols && foldStart != null ? { leftColToFold: foldStart - cols[0].right, rightColFromFold: cols[2].left - foldEnd } : null,
    featured: featured && { gridTemplateColumns: getComputedStyle(featured).gridTemplateColumns, n: getComputedStyle(featured).gridTemplateColumns.split(" ").length },
    docScrollWidth: document.documentElement.scrollWidth,
  };
})()
