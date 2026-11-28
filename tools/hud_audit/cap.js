// injected at test time: records what the HUD draws (text, panels, round buttons) in screen px
(() => {
  const P = CanvasRenderingContext2D.prototype; window.__cap = null;
  const tf = (g, x, y) => { const m = g.getTransform(), k = (cv ? cv.width / VW : 1) || 1; return [(m.a * x + m.c * y + m.e) / k, (m.b * x + m.d * y + m.f) / k, Math.hypot(m.a, m.b) / k]; };
  const _ft = P.fillText; P.fillText = function (s, x, y, mw) { if (window.__cap && this.canvas === cv && this.globalAlpha > .25) { s = String(s); const m = this.measureText(s); let w = m.width; if (mw && w > mw) w = mw; const fs = parseFloat((this.font.match(/([\d.]+)px/) || [0, 12])[1]); const [sx, sy, k] = tf(this, x, y);
      let x0 = sx; if (this.textAlign === 'center') x0 = sx - w * k / 2; else if (this.textAlign === 'right' || this.textAlign === 'end') x0 = sx - w * k; let y0 = this.textBaseline === 'middle' ? sy - fs * k * .5 : this.textBaseline === 'top' ? sy : sy - fs * k * .8;
      window.__cap.push({ t: 'T', s: s.slice(0, 40), x: x0, y: y0, w: w * k, h: fs * k * .95, tag: window.__tag }); } return _ft.apply(this, arguments); };
  const rect = (g, x, y, w, h, kind) => { if (!window.__cap || g.canvas !== cv || g.globalAlpha < .2) return; if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; } const [sx, sy, k] = tf(g, x, y); w *= k; h *= k; if (w < 24 || h < 14 || w * h > VW * VH * .4) return; window.__cap.push({ t: 'R', s: kind, x: sx, y: sy, w, h, tag: window.__tag, pend: kind === 'rr' }); };
  const _fr = P.fillRect; P.fillRect = function (x, y, w, h) { const fs = String(this.fillStyle); if (/rgba\(0, ?0, ?0|rgba\(\d+, ?\d+, ?\d+, ?0?\.[4-9]/.test(fs) || /^#/.test(fs)) rect(this, x, y, w, h, 'fr'); return _fr.apply(this, arguments); };
  if (P.roundRect) { const _rr = P.roundRect; P.roundRect = function (x, y, w, h) { rect(this, x, y, w, h, 'rr'); return _rr.apply(this, arguments); }; }
  const _arc = P.arc; P.arc = function (x, y, r, a0, a1) { if (window.__cap && this.canvas === cv && r >= 17 && Math.abs(a1 - a0) > 6 && this.globalAlpha > .2) { const [sx, sy, k] = tf(this, x, y); if (r * k < 120) window.__cap.push({ t: 'C', s: 'arc', x: sx - r * k, y: sy - r * k, w: 2 * r * k, h: 2 * r * k, r: r * k, tag: window.__tag }); } return _arc.apply(this, arguments); };
  window.__hudCapture = () => { const out = []; window.__cap = out; window.__tag = 'hud'; try { renderHUD(); window.__tag = 'ctl'; renderControls(); } finally { window.__cap = null; }
    // merge duplicates (same circle drawn twice etc.)
    const seen = new Set(), res = []; for (const o of out) { const k = [o.t, Math.round(o.x), Math.round(o.y), Math.round(o.w), Math.round(o.h), o.s].join('|'); if (seen.has(k)) continue; seen.add(k); res.push(o); } return res; };
  window.__hudOverlaps = () => { const E = window.__hudCapture(), out = []; const inter = (a, b) => { const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? w * h : 0; };
    const contains = (a, b, tol) => b.x >= a.x - tol && b.y >= a.y - tol && b.x + b.w <= a.x + a.w + tol && b.y + b.h <= a.y + a.h + tol;
    for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) { const a = E[i], b = E[j]; let ar = inter(a, b); if (ar < 30) continue;
        if (a.t === 'C' && b.t === 'C') { const d = Math.hypot(a.x + a.r - b.x - b.r, a.y + a.r - b.y - b.r); if (d >= a.r + b.r - 2 || d <= Math.abs(a.r - b.r) + 1) continue; ar = Math.round((a.r + b.r - d)); if (ar < 3) continue; }
        else if (a.t === 'C' || b.t === 'C') { const c = a.t === 'C' ? a : b, o = a.t === 'C' ? b : a, cx = c.x + c.r, cy = c.y + c.r, nx = Math.max(o.x, Math.min(cx, o.x + o.w)), ny = Math.max(o.y, Math.min(cy, o.y + o.h)); if (Math.hypot(nx - cx, ny - cy) > c.r - 3) continue; if (contains(c, o, 2)) continue; }
        else { if (contains(a, b, 3) || contains(b, a, 3)) continue; if (a.t === 'T' && b.t === 'T' && Math.min(a.w, b.w) < 12) continue; if (ar < Math.min(a.w * a.h, b.w * b.h) * .12) continue; }
        out.push([a.t + ':' + a.s, b.t + ':' + b.s, Math.round(ar), [Math.round(a.x), Math.round(a.y), Math.round(a.w), Math.round(a.h)], [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)]]); }
    return out; };
})();
