// ================= ramming: weight wins =================
// When a heavy vehicle hits a light one, the light one doesn't just bounce: it's shoved along with the heavy one,
// its tyres break loose so it slides sideways and spins, and it takes the lion's share of the damage. The heavy one
// keeps most of its momentum and barely gets scratched. A tank plows through anything.
const RAM_MIN_RATIO = 1.3;
{ const _cc = carCarCollide; carCarCollide = function (a, b) {
  if (!a || !b || a.dead && b.dead || dist2(a.x, a.y, b.x, b.y) > (a.L / 2 + b.L / 2 + 6) ** 2) return _cc(a, b);
  const va = [a.vx, a.vy], vb = [b.vx, b.vy], ha = a.hp, hb = b.hp; _cc(a, b); if (a.remote || b.remote) return;
  const hit = a.vx !== va[0] || a.vy !== va[1] || b.vx !== vb[0] || b.vy !== vb[1]; if (!hit) return;
  const ma = a.mass || 1, mb = b.mass || 1, heavyA = ma >= mb, H = heavyA ? a : b, Lt = heavyA ? b : a, mH = Math.max(ma, mb), mL = Math.min(ma, mb), ratio = mH / Math.max(.05, mL);
  const vH0 = heavyA ? va : vb, vL0 = heavyA ? vb : va; let nx = Lt.x - H.x, ny = Lt.y - H.y; const nd = Math.hypot(nx, ny) || 1; nx /= nd; ny /= nd;
  const closing = (vH0[0] - vL0[0]) * nx + (vH0[1] - vL0[1]) * ny; if (closing < 60 || ratio < RAM_MIN_RATIO) return;
  const k = clamp((ratio - 1) / ratio, 0, .9);
  // the heavy one keeps going
  H.vx = H.vx + (vH0[0] - H.vx) * .55 * k; H.vy = H.vy + (vH0[1] - H.vy) * .55 * k;
  // the light one is carried along the push direction at (nearly) the heavy one's speed
  const pushV = (vH0[0] * nx + vH0[1] * ny) * (.75 + .2 * k), cur = Lt.vx * nx + Lt.vy * ny; if (cur < pushV) { Lt.vx += nx * (pushV - cur); Lt.vy += ny * (pushV - cur); }
  // its tyres break loose and it spins around the contact point
  Lt.shoveT = clamp(.3 + closing / 500 * Math.min(ratio, 4) * .35, .35, 1.6); Lt.shoveG = clamp(.45 / ratio, .05, .3);
  const fx = Math.cos(Lt.a), fy = Math.sin(Lt.a), lever = (H.x - Lt.x) * fx + (H.y - Lt.y) * fy, side = fx * ny - fy * nx;
  Lt.av = (Lt.av || 0) + clamp(-Math.sign(lever * side || 1) * (closing / 160) * Math.min(ratio, 3) * .6, -6, 6);
  // damage follows weight: the light one takes almost all of it
  const dA = Math.max(0, ha - a.hp), dB = Math.max(0, hb - b.hp), tot = dA + dB; if (tot > 0) { const share = 1 / (1 + Math.pow(ratio, 1.6)), wantH = tot * share, gotH = heavyA ? dA : dB, extraL = Math.max(0, gotH - wantH);
    if (!H.dead) H.hp = Math.min(H.st ? H.st.hp : H.hp + extraL, H.hp + extraL); if (!Lt.dead && extraL > 0) Lt.damage(extraL * 1.15, H.driver); }
  if (ratio >= 2.2 && closing > 160) { if (Lt === pCar() || H === pCar()) G.cam.shake = Math.min(14, (G.cam.shake || 0) + closing / 60); if (Lt.d && Lt.d.two) crashEject(Lt, closing * 3, H); }
}; }
