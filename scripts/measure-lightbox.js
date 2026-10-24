(async () => {
  let dlg = document.querySelector('[role=dialog][aria-modal=true]');
  if (!dlg) {
    const trig = document.querySelector('[aria-label^="View "][role=button]');
    trig.scrollIntoView({ block: "center" });
    trig.click();
    await new Promise(r => setTimeout(r, 1500));
    dlg = document.querySelector('[role=dialog][aria-modal=true]');
  }
  const img = dlg.querySelector("img");
  const box = img.parentElement.getBoundingClientRect();
  const cs = getComputedStyle(dlg);
  const segs = window.viewport?.segments?.map(s => ({ x: s.x, w: s.width })) ?? null;
  const foldStart = segs?.length === 2 ? segs[0].x + segs[0].w : null;
  return {
    viewport: { w: innerWidth, h: innerHeight },
    mq_h2: matchMedia("(horizontal-viewport-segments: 2)").matches,
    segments: segs,
    dialog: { paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, gutter: cs.getPropertyValue("--gutter").trim(), className: dlg.className },
    imageBox: { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width },
    imgComplete: img.complete, imgNatural: [img.naturalWidth, img.naturalHeight],
    imageRightVsFold: foldStart != null ? box.right - foldStart : null,
    onFirstSegment: foldStart != null ? box.right <= foldStart : null,
  };
})()
