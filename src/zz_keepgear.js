// ================= you keep your guns =================
// Only NPCs drop their guns. Getting wasted or busted, you wake up (or walk out) with every gun you were carrying —
// the same individual guns, with their attachments and wear, and whatever ammo you hadn't fired. Armor is still lost.
{ const _rs = respawn; respawn = function () { const p = G.player, ammo = p.ammo.slice(), clip = p.clip.slice(), w = p.weapon; const r = _rs.apply(this, arguments);
  for (let i = 1; i < ammo.length && i < p.ammo.length; i++) { p.ammo[i] = isFinite(ammo[i]) ? ammo[i] : 0; p.clip[i] = isFinite(clip[i]) ? Math.min(clip[i], p.ammo[i]) : 0; }
  if (w > 0 && p.ammo[w] > 0) p.weapon = w; PWC = {}; doSave(true); return r; }; }
