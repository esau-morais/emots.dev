// ---------- device model (to scale: 1 pt = 1 px; from the emots.dev iPhone Duo mockup) ----------
      const W = 495.4, H = 709.2, T = 31.3, GAP = 5.7;
      const R_FREE = 75.5, R_HINGE = 22;
      const IN_W = 951, IN_H = 669, IN_BORDER_X = W - IN_W / 2, IN_BORDER_Y = (H - IN_H) / 2, IN_R = 55;
      const OUT_W = 466, OUT_H = 678, OUT_HINGE = 14.1, OUT_Y = (H - OUT_H) / 2;
      const SLICES = 12;
      const DARK = { bg: '#0a0a0a', fg: '#f2f2f2', glass: 'rgba(255,255,255,.10)', edge: 'rgba(255,255,255,.14)', dim: '#9a9a9a' };
      const LIGHT = { bg: '#f7f7f5', fg: '#161616', glass: 'rgba(0,0,0,.06)', edge: 'rgba(0,0,0,.10)', dim: '#6a6a66' };

      const $ = (s) => document.querySelector(s);
      const el = (tag, cls, style = {}, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; Object.assign(n.style, style); if (html) n.innerHTML = html; return n; };
      const px = (n) => n + 'px';
      const radii = (tl, tr, br, bl) => `${tl}px ${tr}px ${br}px ${bl}px`;

      const ic = {
        back: (c) => `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        fwd: (c) => `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M7.5 4l6 6-6 6" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></svg>`,
        share: (c) => `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5v10M6.5 6 10 2.5 13.5 6"/><path d="M6.5 9H5v8.5h10V9h-1.5"/></svg>`,
        book: (c) => `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M10 5.5C8 4 5.5 3.8 3 4.3v11c2.5-.5 5-.3 7 1.2 2-1.5 4.5-1.7 7-1.2v-11c-2.5-.5-5-.3-7 1.2zM10 5.5v11"/></svg>`,
        tabs: (c) => `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.8"><rect x="3" y="6" width="11" height="11" rx="2.5"/><path d="M6.5 3h8A2.5 2.5 0 0 1 17 5.5v8"/></svg>`,
        side: (c) => `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="${c}" stroke-width="1.8"><rect x="2" y="3" width="18" height="14" rx="3"/><path d="M8 3v14"/></svg>`,
        reload: (c) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3"/></svg>`,
        lock: (c) => `<svg width="10" height="12" viewBox="0 0 10 12"><rect x="0.5" y="5" width="9" height="6.5" rx="1.5" fill="${c}"/><path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="${c}" stroke-width="1.4"/></svg>`,
      };
      const ring = (c) => `<svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <path d="M6.72 32.7A18.95 18.95 0 1 1 39.28 32.7" stroke="${c}" stroke-opacity=".28" stroke-width="3.1" stroke-linecap="round"/>
        <path d="M6.72 32.7A18.95 18.95 0 1 1 39.28 32.7" stroke="${c}" stroke-width="3.1" stroke-linecap="round" pathLength="100" stroke-dasharray="78 100"/>
        <path d="M14.5 20.5a12 12 0 0 1 17 0M17.6 23.6a7.6 7.6 0 0 1 10.8 0" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M23 29.3l-2.6-2.7a3.7 3.7 0 0 1 5.2 0z" fill="${c}"/>
        <g fill="${c}"><circle cx="32.5" cy="39.4" r="2"/><circle cx="26.3" cy="41.7" r="2"/><circle cx="19.7" cy="41.7" r="2"/><circle cx="13.5" cy="39.4" r="2" opacity=".35"/></g></svg>`;

      const stack = (parent, x, y, icons, s) => {
        const h = 20 + icons.length * 36 + (icons.length - 1) * 18;
        parent.append(el('div', 'gbtn', { left: px(x), top: px(y), width: '48px', height: px(h), background: s.glass, boxShadow: `inset 0 0 0 1px ${s.edge}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }, icons.join('')));
        return h;
      };
      function rail(parent, x, h, s, opts) {
        const r = el('div', 'rail', { left: px(x), top: 0, width: '84px', height: px(h), background: s.bg });
        const cx = 12; let y = 24;
        if (opts.cameraTop) y += 48;
        r.append(el('div', '', { position: 'absolute', left: px(cx), top: px(y + 11), width: '48px', textAlign: 'center', font: '700 16px/19px Inter, sans-serif', color: s.fg }, '9:41'));
        r.append(el('div', '', { position: 'absolute', left: px(cx + 1), top: px(y + 35) }, ring(s.fg)));
        y += 98;
        y += stack(r, cx, y, [ic.back(s.fg), ic.fwd(s.fg)], s) + 12;
        const bottom = h - 24 - (opts.cameraBottom ? 48 : 0), h3 = 20 + 3 * 36 + 2 * 18;
        if (bottom - h3 > y) stack(r, cx, bottom - h3, [ic.share(s.fg), ic.book(s.fg), ic.tabs(s.fg)], s);
        parent.append(r);
      }
      function urlstrip(parent, x, y, w, s) {
        const u = el('div', 'urlstrip', { left: px(x), top: px(y), width: px(w), height: '60px', background: s.bg });
        u.append(el('div', 'cap', { left: '8px', right: '8px', top: '8px', height: '44px', background: s.glass, boxShadow: `inset 0 0 0 1px ${s.edge}`, color: s.fg },
          `<span style="font-weight:600;font-size:14px">aA</span><span class="host">${ic.lock(s.dim)} emots.dev</span>${ic.reload(s.fg)}`));
        parent.append(u);
      }
      function topbar(parent, w, s, path) {
        const b = el('div', 'topbar', { left: 0, top: 0, width: px(w), height: '49px', background: s.bg });
        b.append(el('div', '', { position: 'absolute', left: '20px', top: '13px', display: 'flex', gap: '18px', alignItems: 'center' }, ic.side(s.fg) + ic.back(s.fg) + ic.fwd(s.fg)));
        const cw = 360;
        b.append(el('div', 'cap', { left: px((w - cw) / 2), top: '6px', width: px(cw), height: '37px', background: s.glass, boxShadow: `inset 0 0 0 1px ${s.edge}`, color: s.fg, fontSize: '14px' },
          `<span style="font-weight:600;font-size:13px">aA</span><span class="host">${ic.lock(s.dim)} emots.dev<span style="color:${s.dim};font-weight:400">${path}</span></span>${ic.reload(s.fg)}`));
        b.append(el('div', '', { position: 'absolute', right: '74px', top: '15px', font: '700 16px/19px Inter, sans-serif', color: s.fg }, '9:41'));
        b.append(el('div', '', { position: 'absolute', right: '22px', top: '2px' }, ring(s.fg)));
        parent.append(b);
        return b;
      }

      // ---------- screens ----------
      // outer, portrait: Safari's URL field under the page and its rail on the trailing edge
      const portrait = el('div', 'scr', { width: '466px', height: '678px', background: DARK.bg });
      const pLight = el('div', '', { position: 'absolute', inset: 0 }), pDark = el('div', '', { position: 'absolute', inset: 0 });
      for (const [layer, s] of [[pLight, LIGHT], [pDark, DARK]]) { layer.style.background = s.bg; urlstrip(layer, 0, 618, 382, s); rail(layer, 382, 678, s, { cameraTop: true }); }
      portrait.append(pLight, pDark);
      const webP = $('#web-portrait'); webP.style.left = '0px'; webP.style.top = '0px'; portrait.append(webP);
      // outer, landscape (device turned sideways): content box counter-rotated to read upright
      const landscape = el('div', 'scr', { width: '678px', height: '466px', background: DARK.bg, left: px((OUT_W - OUT_H) / 2), top: px((OUT_H - OUT_W) / 2), transform: 'rotate(-90deg)' });
      urlstrip(landscape, 0, 406, 594, DARK); rail(landscape, 594, 466, DARK, { cameraBottom: true });
      const webL = $('#web-landscape'); webL.style.left = '0px'; webL.style.top = '0px'; landscape.append(webL);

      // inner: two halves (one per leaf) show a still while the hinge moves; once flat, a single plane plays the captures
      const innerHalf = () => {
        // inner display held in portrait (hinge across the middle): a 669x951 screen, counter-rotated into the model's 951x669 panel
        const scr = el('div', 'scr', { width: px(IN_W), height: px(IN_H), background: DARK.bg });
        const pt = el('div', 'scr', { width: px(IN_H), height: px(IN_W), left: px((IN_W - IN_H) / 2), top: px((IN_H - IN_W) / 2), transform: 'rotate(-90deg)', background: DARK.bg });
        topbar(pt, IN_H, DARK, '/work/edite');
        const w = el('div', 'web', { left: 0, top: '49px', width: px(IN_H), height: '902px' });
        const img = el('img'); img.src = CAP; w.append(img);
        w.append(el('div', 'foldline-y', { top: px(FOLD_Y) }));
        w.append(el('div', 'foldtag-y', { top: px(FOLD_Y + 8) }, 'fold'));
        pt.append(w); scr.append(pt); return scr;
      };

      let outerLeaf, camLeaf, innerHalves = [];
      function build() {
        const device = $('#device');
        const cam = el('div', 'leaf cam', { left: 0, top: px(-H / 2), width: px(W), height: px(H) });
        const out = el('div', 'leaf outer', { left: px(-W), top: px(-H / 2), width: px(W), height: px(H), transformOrigin: `100% 50% ${GAP / 2}px` });
        for (const [leaf, rFront] of [[cam, radii(R_HINGE, R_FREE, R_FREE, R_HINGE)], [out, radii(R_FREE, R_HINGE, R_HINGE, R_FREE)]]) {
          for (let i = 1; i < SLICES; i++) leaf.append(el('div', 'slice', { borderRadius: rFront, transform: `translateZ(${-T * i / SLICES}px)` }));
        }
        cam.append(el('div', 'edge hinge', { left: px(-T / 2), top: px(R_HINGE), width: px(T), height: px(H - 2 * R_HINGE), transform: `translateZ(${-T / 2}px) rotateY(-90deg)` }));
        out.append(el('div', 'edge hinge', { left: px(W - T / 2), top: px(R_HINGE), width: px(T), height: px(H - 2 * R_HINGE), transform: `translateZ(${-T / 2}px) rotateY(90deg)` }));
        cam.append(el('div', 'btn', { left: px(W - 7), top: '202px', width: '14px', height: '112.6px', transform: `translateZ(${-T / 2}px) translateX(2.5px) rotateY(90deg)` }));
        cam.append(el('div', 'btn', { left: px(W - 7), top: px(H - 145.9 - 103.1), width: '14px', height: '103.1px', transform: `translateZ(${-T / 2}px) translateX(1px) rotateY(90deg)` }));
        for (const x0 of [125.8, 125.8 + 65.7 + 15.1]) cam.append(el('div', 'btn', { left: px(W - x0 - 65.7), top: '-7px', width: '65.7px', height: '14px', transform: `translateZ(${-T / 2}px) translateY(-2.5px) rotateX(90deg)` }));
        out.append(el('div', 'port', { left: px(W - 247 - 25), top: px(H - 7.5), width: '50px', height: '15px', transform: `translateZ(${-T / 2}px) translateY(1px) rotateX(-90deg)` }));

        // inner display halves
        innerHalves = [];
        for (const [leaf, isLeft] of [[out, true], [cam, false]]) {
          const f = el('div', 'face front glass', { borderRadius: isLeft ? radii(R_FREE, 0, 0, R_FREE) : radii(0, R_FREE, R_FREE, 0), transform: 'translateZ(.5px)' });
          const clip = el('div', '', { position: 'absolute', top: px(IN_BORDER_Y), left: px(isLeft ? IN_BORDER_X : 0), width: px(IN_W / 2), height: px(IN_H), overflow: 'hidden', borderRadius: isLeft ? radii(IN_R, 0, 0, IN_R) : radii(0, IN_R, IN_R, 0) });
          const holder = el('div', '', { position: 'absolute', top: 0, left: px(isLeft ? 0 : -IN_W / 2), width: px(IN_W), height: px(IN_H) });
          holder.append(innerHalf()); clip.append(holder); f.append(clip);
          f.append(el('div', 'crease', { [isLeft ? 'right' : 'left']: 0, background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, transparent, rgba(255,255,255,.05) 70%, rgba(0,0,0,.18))` }));
          f.append(el('div', 'sheen'));
          leaf.append(f); innerHalves.push(holder);
        }
        // outer display on the outer leaf's back
        const ob = el('div', 'face back glass', { borderRadius: radii(R_HINGE, R_FREE, R_FREE, R_HINGE), transform: `translateZ(${-T}px) rotateY(180deg)` });
        const od = el('div', '', { position: 'absolute', left: px(OUT_HINGE), top: px(OUT_Y), width: px(OUT_W), height: px(OUT_H), overflow: 'hidden', borderRadius: radii(14, 58, 58, 14) });
        od.append(portrait, landscape, el('div', 'lens-front', { left: px(417.8 - 18.5), top: px(47.8 - 18.5) }));
        ob.append(od, el('div', 'sheen'));
        out.append(ob);
        // camera leaf back: Night Sky glass, the camera plateau and the Apple logo
        const cb = el('div', 'face back cam', { borderRadius: radii(R_FREE, R_HINGE, R_HINGE, R_FREE), transform: `translateZ(${-T}px) rotateY(180deg)` });
        cb.append(el('div', 'backpanel', { borderRadius: radii(R_FREE, R_HINGE, R_HINGE, R_FREE), backfaceVisibility: 'hidden',
          background: 'radial-gradient(120% 70% at 30% 18%, rgba(255,255,255,.07), transparent 60%), linear-gradient(165deg, #333e4d, #252e3a 55%, #1f2731)',
          boxShadow: 'inset 0 0 0 1.5px rgba(150,165,185,.35)' }));
        cb.append(el('div', '', { position: 'absolute', left: px(W / 2 - 34), top: px(H * 0.47 - 41), width: '68px', height: '82px', backfaceVisibility: 'hidden', transform: 'translateZ(.4px)' },
          `<svg viewBox="0 0 384 512" width="68" height="82"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6b7e"/><stop offset=".55" stop-color="#3a4655"/><stop offset="1" stop-color="#4d5a6b"/></linearGradient></defs>
          <path fill="url(#lg)" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`));
        // plateau: a soft-edged raised pill in the body colour (55.8 x 21.2 mm)
        const BX = 28.4, BY = 28.4, BW = 335.8, BH = 127.3, BZ = 14;
        for (let z = 2; z < BZ; z += 2) cb.append(el('div', 'bump-layer', { left: px(BX + (BZ - z) * 0.35), top: px(BY + (BZ - z) * 0.35), width: px(BW - (BZ - z) * 0.7), height: px(BH - (BZ - z) * 0.7),
          background: `linear-gradient(90deg, #1f2731, ${z > BZ - 5 ? '#5a6779' : '#3b4757'} 45%, #232b35)`, transform: `translateZ(${z}px)` }));
        cb.append(el('div', 'bump-layer', { left: px(BX), top: px(BY), width: px(BW), height: px(BH), transform: `translateZ(${BZ}px)`, backfaceVisibility: 'hidden',
          background: 'radial-gradient(90% 120% at 30% 10%, rgba(255,255,255,.10), transparent 55%), linear-gradient(165deg, #364252, #28313d)',
          boxShadow: 'inset 0 0 0 1.5px rgba(170,185,205,.35), inset 0 -6px 14px rgba(0,0,0,.35)' }));
        for (const lx of [92, 199]) {
          const R = 45, cy = BY + BH / 2;
          // anodised ring rising off the plateau, then the lens glass
          for (let z = BZ + 2; z < BZ + 9; z += 2) cb.append(el('div', 'lens-layer', { left: px(lx - R), top: px(cy - R), width: px(2 * R), height: px(2 * R), background: '#2a333f', transform: `translateZ(${z}px)` }));
          cb.append(el('div', 'lens-layer', { left: px(lx - R), top: px(cy - R), width: px(2 * R), height: px(2 * R), transform: `translateZ(${BZ + 9}px)`, backfaceVisibility: 'hidden',
            background: 'conic-gradient(from 200deg, #6f7f94, #2b3440 25%, #8b9bb0 45%, #2b3440 70%, #6f7f94)' }));
          cb.append(el('div', 'lens-layer', { left: px(lx - R + 7), top: px(cy - R + 7), width: px(2 * R - 14), height: px(2 * R - 14), transform: `translateZ(${BZ + 9.3}px)`, backfaceVisibility: 'hidden',
            background: 'radial-gradient(circle at 50% 50%, #020305 0 22%, #10162a 30%, #04060a 40%, #1b2236 52%, #06080c 64%, #11151c 80%, #2b323c 100%)',
            boxShadow: 'inset 0 0 0 2px #0c0f14' }));
          cb.append(el('div', 'lens-layer', { left: px(lx - 26), top: px(cy - 26), width: '52px', height: '52px', transform: `translateZ(${BZ + 9.5}px)`, backfaceVisibility: 'hidden',
            background: 'conic-gradient(from 30deg, rgba(120,90,200,.0), rgba(120,90,200,.35), rgba(60,180,170,.25), rgba(120,90,200,.0) 60%)', mixBlendMode: 'screen' }));
          cb.append(el('div', 'lens-layer', { left: px(lx - 17), top: px(cy - 22), width: '11px', height: '11px', background: 'rgba(255,255,255,.7)', filter: 'blur(1.2px)', transform: `translateZ(${BZ + 9.7}px)`, backfaceVisibility: 'hidden' }));
        }
        // flash and microphone at the plateau's end
        cb.append(el('div', 'lens-layer', { left: '282px', top: px(BY + 40), width: '30px', height: '17px', borderRadius: '9px', background: 'radial-gradient(circle, #f6efe0 0 30%, #cdc5b3 60%, #8f8b80)',
          boxShadow: 'inset 0 0 0 1.5px #59626e', transform: `translateZ(${BZ + 0.5}px)`, backfaceVisibility: 'hidden' }));
        cb.append(el('div', 'lens-layer', { left: '293.5px', top: px(BY + 80), width: '7px', height: '7px', background: '#0b0e12', transform: `translateZ(${BZ + 0.5}px)`, backfaceVisibility: 'hidden' }));
        cam.append(cb);

        // the flat inner screen: spans both leaves when the hinge is at 180°
        // fully open, the leaves are swapped for one flat panel: a single plane keeps Chrome's 3D sorting clean at close zoom
        const flat = el('div', '', { position: 'absolute', left: px(-W), top: px(-H / 2), width: px(2 * W), height: px(H), borderRadius: px(R_FREE), background: '#050506',
          boxShadow: 'inset 0 0 0 1.5px #1a1f26, 0 0 0 4px #56637484, 0 0 0 5px #2a323d', transformStyle: 'preserve-3d' });
        flat.id = 'flat';
        for (let i = 1; i < 8; i++) flat.append(el('div', 'slice', { borderRadius: px(R_FREE), transform: `translateZ(${-T * i / 8}px)` }));
        const fwin = el('div', '', { position: 'absolute', left: px(IN_BORDER_X), top: px(IN_BORDER_Y), width: px(IN_W), height: px(IN_H), overflow: 'hidden', borderRadius: px(IN_R) });
        const fscr = el('div', 'scr', { width: px(IN_W), height: px(IN_H), background: DARK.bg });
        const tbHome = topbar(fscr, IN_W, DARK, ''); tbHome.id = 'tbHome';
        const tbWork = topbar(fscr, IN_W, DARK, '/work/emots-dev'); tbWork.id = 'tbWork';
        const webI = $('#web-inner'); webI.style.left = '0px'; webI.style.top = '49px'; fscr.append(webI);
        flat.append(fwin); fwin.append(fscr, el('div', 'crease', { left: px(IN_W / 2 - 9), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.04) 45%, rgba(0,0,0,.14) 55%, transparent)' }), el('div', 'sheen'));
        // hinge spine: a half cylinder on the hinge axis; closed it bridges both halves, open it tucks behind
        const spine = el('div', '', { position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }); spine.id = 'spine';
        const SR = (2 * T + GAP) / 2, SH = H - 2 * R_HINGE * 0.55, SN = 14, sw = Math.PI * SR / SN + 0.8;
        for (let i = 0; i < SN; i++) {
          const a = -180 + (i + 0.5) * 180 / SN, lit = Math.cos((a + 120) * Math.PI / 180);
          const c0 = Math.round(34 + 40 * Math.max(0, lit)), c1 = Math.round(44 + 50 * Math.max(0, lit)), c2 = Math.round(56 + 60 * Math.max(0, lit));
          spine.append(el('div', 'spine', { left: px(-sw / 2), top: px(-SH / 2), width: px(sw), height: px(SH), background: `rgb(${c0},${c1},${c2})`, transform: `rotateY(${a}deg) translateZ(${SR}px)` }));
        }
        for (const y of [-SH / 2, SH / 2]) spine.append(el('div', 'spine-cap', { left: px(-SR), top: px(y - SR), width: px(2 * SR), height: px(2 * SR), clipPath: 'inset(0 50% 0 0)', transform: `rotateX(90deg)` }));
        device.append(cam, out, flat, spine);
        outerLeaf = out; camLeaf = cam;
      }

      // ---------- pose ----------
      const S = { theta: 0, rx: -4, ry: 200, orient: 0, lift: 1150, dx: 0, fit: 0.86 };
      const STAGE_W = 1920, STAGE_H = 1080;
      function place() {
        const th = S.theta * Math.PI / 180, phi = 180 - S.theta;
        outerLeaf.style.transform = `translateZ(${GAP / 2}px) rotateY(${phi}deg) translateZ(${-GAP / 2}px)`;
        $('#spine').style.transform = `translateZ(${GAP / 2}px) rotateY(${-90 * S.theta / 180}deg)`;
        const xMin = Math.min(W * Math.cos(th), 0);
        const cx = (xMin + W) / 2, cz = (Math.max(W * Math.sin(th), T + GAP) - T) / 2;
        // fit blends between the portrait and sideways framings as the device turns
        const fw = W - xMin + 80, fh = H + 80, o = Math.sin(S.orient * Math.PI / 180);
        const bw = fw * (1 - o) + fh * o, bh = fh * (1 - o) + fw * o;
        const k = Math.min(STAGE_W / bw, STAGE_H / bh) * S.fit;
        $('#device').style.transform = `scale3d(${k}, ${k}, ${k}) rotateX(${S.rx}deg) rotateY(${S.ry}deg) rotateZ(${S.orient}deg) translate3d(${-cx}px, 0, ${-cz}px)`;
        $('#lift').style.transform = `translate3d(${S.dx}px, ${S.lift}px, 0)`;
        const open = S.theta > 179.5;
        $('#flat').style.visibility = open ? 'visible' : 'hidden';
        $('#spine').style.visibility = open ? 'hidden' : 'visible';
        outerLeaf.style.visibility = camLeaf.style.visibility = open ? 'hidden' : 'visible';
      }

      