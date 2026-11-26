#!/usr/bin/env python3
"""A small, strict Dalvik .dex writer: several classes, instance fields, try/catch-all blocks,
runtime-visible method annotations, and a label-based assembler for the handful of opcodes we use.
Used by build_apk.py; check_dex() re-parses the result and verifies the structure."""
import hashlib, struct, zlib

u8 = lambda v: struct.pack('<B', v); u16 = lambda v: struct.pack('<H', v & 0xffff); u32 = lambda v: struct.pack('<I', v & 0xffffffff)

def uleb(v):
    out = bytearray()
    while True:
        b = v & 0x7f; v >>= 7
        if v: out.append(b | 0x80)
        else: out.append(b); return bytes(out)

def sleb(v):
    out = bytearray()
    while True:
        b = v & 0x7f; v >>= 7
        if (v == 0 and not b & 0x40) or (v == -1 and b & 0x40): out.append(b); return bytes(out)
        out.append(b | 0x80)

def shorty(r, ps): return ''.join('L' if t[0] in 'L[' else t for t in (r,) + tuple(ps))
def pwords(ps): return sum(2 if t in ('J', 'D') else 1 for t in ps)


class Code:
    """Assembler for one method. Registers are plain ints. Branches/handlers use labels."""
    def __init__(self, regs, ins, outs):
        self.regs, self.ins, self.outs = regs, ins, outs
        self.items = []      # (kind, payload)
        self.tries = []      # (start_label, end_label, handler_label)
    # --- low level
    def raw(self, words, fix=None): self.items.append(('i', words, fix))
    def label(self, name): self.items.append(('l', name, None))
    def try_(self, start, end, handler): self.tries.append((start, end, handler))
    # --- instructions (refs resolved later through the Dex object)
    def const4(self, a, v): assert 0 <= a < 16 and -8 <= v < 8; self.raw([((v & 0xf) << 12) | (a << 8) | 0x12])
    def const16(self, a, v): assert -32768 <= v < 32768; self.raw([(a << 8) | 0x13, v & 0xffff])
    def consthigh16(self, a, hi): self.raw([(a << 8) | 0x15, hi & 0xffff])
    def cstr(self, a, s): self.raw([(a << 8) | 0x1a, ('s', s)])
    def newi(self, a, t): self.raw([(a << 8) | 0x22, ('t', t)])
    def cast(self, a, t): self.raw([(a << 8) | 0x1f, ('t', t)])
    def mres(self, a): self.raw([(a << 8) | 0x0a])
    def mreso(self, a): self.raw([(a << 8) | 0x0c])
    def ret_void(self): self.raw([0x000e])
    def ret(self, a): self.raw([(a << 8) | 0x0f])
    def reto(self, a): self.raw([(a << 8) | 0x11])
    def iget_o(self, a, obj, f): self.raw([(obj << 12) | (a << 8) | 0x54, ('f', f)])
    def iput_o(self, a, obj, f): self.raw([(obj << 12) | (a << 8) | 0x5b, ('f', f)])
    def addlit8(self, a, b, v): assert -128 <= v < 128; self.raw([(a << 8) | 0xd8, ((v & 0xff) << 8) | b])
    def _if1(self, op, a, lab): self.raw([(a << 8) | op, ('b', lab)])
    def ifeqz(self, a, lab): self._if1(0x38, a, lab)
    def ifnez(self, a, lab): self._if1(0x39, a, lab)
    def ifltz(self, a, lab): self._if1(0x3a, a, lab)
    def ifgtz(self, a, lab): self._if1(0x3c, a, lab)
    def goto(self, lab): self.raw([0x0029, ('b', lab)])  # goto/16
    def _inv(self, op, m, regs):
        assert len(regs) <= 5 and all(0 <= r < 16 for r in regs)
        r = list(regs) + [0] * (5 - len(regs)); self.raw([(len(regs) << 12) | (r[4] << 8) | op, ('m', m), (r[3] << 12) | (r[2] << 8) | (r[1] << 4) | r[0]])
    def iv(self, m, *regs): self._inv(0x6e, m, regs)
    def isup(self, m, *regs): self._inv(0x6f, m, regs)
    def idir(self, m, *regs): self._inv(0x70, m, regs)
    def ist(self, m, *regs): self._inv(0x71, m, regs)


class Dex:
    def __init__(self):
        self.classes = []   # dict(name, sup, access, fields[(name,type)], methods[...])
    def cls(self, name, sup, access=0x1):
        c = dict(name=name, sup=sup, access=access, fields=[], direct=[], virtual=[]); self.classes.append(c); return c
    @staticmethod
    def field(c, name, typ): c['fields'].append((name, typ))
    @staticmethod
    def method(c, name, ret, params, access, code, annot=None, direct=False):
        (c['direct'] if direct else c['virtual']).append(dict(name=name, ret=ret, params=tuple(params), access=access, code=code, annot=annot))

    def build(self):
        S, T, P, F, M = set(), set(), set(), set(), set()
        def ty(t): T.add(t); S.add(t)
        def pr(r, ps): ty(r); [ty(x) for x in ps]; P.add((r, tuple(ps))); S.add(shorty(r, ps))
        def mref(m): c, n, r, ps = m; ty(c); S.add(n); pr(r, ps); M.add((c, n, r, tuple(ps)))
        def fref(f): c, n, t = f; ty(c); ty(t); S.add(n); F.add(f)
        annots = set()
        for c in self.classes:
            ty(c['name']); ty(c['sup'])
            for n, t in c['fields']: fref((c['name'], n, t))
            for m in c['direct'] + c['virtual']:
                mref((c['name'], m['name'], m['ret'], m['params']))
                if m['annot']: ty(m['annot']); annots.add(m['annot'])
                for it in m['code'].items:
                    if it[0] != 'i': continue
                    for w in it[1]:
                        if isinstance(w, tuple):
                            k, v = w
                            if k == 's': S.add(v)
                            elif k == 't': ty(v)
                            elif k == 'm': mref(v)
                            elif k == 'f': fref(v)
        strings = sorted(S, key=lambda s: s.encode('utf-16-be'))
        SI = {s: i for i, s in enumerate(strings)}
        types = sorted(T, key=lambda t: SI[t]); TI = {t: i for i, t in enumerate(types)}
        protos = sorted(P, key=lambda p: (TI[p[0]], [TI[x] for x in p[1]])); PI = {p: i for i, p in enumerate(protos)}
        fields = sorted(F, key=lambda f: (TI[f[0]], SI[f[1]], TI[f[2]])); FI = {f: i for i, f in enumerate(fields)}
        meths = sorted(M, key=lambda m: (TI[m[0]], SI[m[1]], PI[(m[2], m[3])])); MI = {m: i for i, m in enumerate(meths)}
        self.idx = dict(SI=SI, TI=TI, PI=PI, FI=FI, MI=MI)

        def assemble(code):
            # pass 1: addresses
            addr, labels = 0, {}
            for it in code.items:
                if it[0] == 'l': labels[it[1]] = addr
                else: addr += len(it[1])
            out = []
            addr = 0
            for it in code.items:
                if it[0] == 'l': continue
                for w in it[1]:
                    if isinstance(w, tuple):
                        k, v = w
                        if k == 's': w = SI[v]
                        elif k == 't': w = TI[v]
                        elif k == 'm': w = MI[v]
                        elif k == 'f': w = FI[v]
                        elif k == 'b':
                            d = labels[v] - addr; assert -32768 <= d < 32768 and d != 0; w = d & 0xffff
                    assert 0 <= w <= 0xffff, w
                    out.append(w)
                addr += len(it[1])
            tries = []
            for s, e, h in code.tries: tries.append((labels[s], labels[e] - labels[s], labels[h]))
            tries.sort()
            return out, tries

        n_s, n_t, n_p, n_f, n_m, n_c = len(strings), len(types), len(protos), len(fields), len(meths), len(self.classes)
        off = 0x70
        o_str = off; off += 4 * n_s
        o_typ = off; off += 4 * n_t
        o_pro = off; off += 12 * n_p
        o_fld = off; off += 8 * n_f
        o_met = off; off += 8 * n_m
        o_cls = off; off += 32 * n_c
        data_off = off
        data = bytearray()
        at = lambda: data_off + len(data)
        def align4():
            while at() % 4: data.append(0)
        mapi = []
        # --- code items (in method-id order)
        allm = [(c, m) for c in self.classes for m in c['direct'] + c['virtual']]
        allm.sort(key=lambda cm: MI[(cm[0]['name'], cm[1]['name'], cm[1]['ret'], cm[1]['params'])])
        align4(); o_code0 = at(); code_off = {}
        for c, m in allm:
            align4(); key = (c['name'], m['name'], m['ret'], m['params']); code_off[key] = at(); cd = m['code']
            insns, tries = assemble(cd)
            ins_expected = pwords(m['params']) + (0 if m['access'] & 0x8 else 1)
            assert cd.ins == ins_expected, (key, cd.ins, ins_expected)
            assert cd.regs >= cd.ins
            data.extend(u16(cd.regs) + u16(cd.ins) + u16(cd.outs) + u16(len(tries)) + u32(0) + u32(len(insns)) + b''.join(u16(w) for w in insns))
            if tries:
                if len(insns) % 2: data.extend(u16(0))
                # one catch-all handler per distinct handler address
                hs = sorted({t[2] for t in tries}); hbody = bytearray(uleb(len(hs))); hoff = {}
                for h in hs: hoff[h] = len(hbody); hbody += sleb(0) + uleb(h)
                for s, n, h in tries: data.extend(u32(s) + u16(n) + u16(hoff[h]))
                data.extend(hbody)
        mapi.append((0x2001, len(allm), o_code0))
        # --- type lists
        align4(); o_tl0 = at(); tl_off = {}
        lists = sorted({p[1] for p in protos if p[1]}, key=lambda l: [TI[x] for x in l])
        for l in lists:
            align4(); tl_off[l] = at(); data.extend(u32(len(l)) + b''.join(u16(TI[t]) for t in l))
        if lists: mapi.append((0x1001, len(lists), o_tl0))
        # --- string data
        o_sd0 = at(); sd_off = []
        for s in strings:
            sd_off.append(at()); data.extend(uleb(len(s)) + s.encode('utf-8') + b'\0')
        mapi.append((0x2002, n_s, o_sd0))
        # --- class data
        o_cd0 = at(); cdata_off = {}
        for c in self.classes:
            cdata_off[c['name']] = at()
            fl = sorted(FI[(c['name'], n, t)] for n, t in c['fields'])
            dm = sorted(c['direct'], key=lambda m: MI[(c['name'], m['name'], m['ret'], m['params'])])
            vm = sorted(c['virtual'], key=lambda m: MI[(c['name'], m['name'], m['ret'], m['params'])])
            b = uleb(0) + uleb(len(fl)) + uleb(len(dm)) + uleb(len(vm)); prev = 0
            for f in fl: b += uleb(f - prev) + uleb(0x1); prev = f
            for group in (dm, vm):
                prev = 0
                for m in group:
                    k = (c['name'], m['name'], m['ret'], m['params']); b += uleb(MI[k] - prev) + uleb(m['access']) + uleb(code_off[k]); prev = MI[k]
            data.extend(b)
        mapi.append((0x2000, n_c, o_cd0))
        # --- annotations: one annotation item per annotation type, one set each, one directory per class that needs it
        dir_off = {}
        if annots:
            o_an0 = at(); an_off = {}
            for a in sorted(annots, key=lambda a: TI[a]):
                an_off[a] = at(); data.extend(u8(0x01) + uleb(TI[a]) + uleb(0))   # VISIBILITY_RUNTIME, no elements
            mapi.append((0x2004, len(annots), o_an0))
            align4(); o_as0 = at(); as_off = {}
            for a in sorted(annots, key=lambda a: TI[a]):
                align4(); as_off[a] = at(); data.extend(u32(1) + u32(an_off[a]))
            mapi.append((0x1003, len(annots), o_as0))
            align4(); o_ad0 = at(); n_ad = 0
            for c in self.classes:
                am = sorted([m for m in c['direct'] + c['virtual'] if m['annot']], key=lambda m: MI[(c['name'], m['name'], m['ret'], m['params'])])
                if not am: continue
                align4(); dir_off[c['name']] = at(); n_ad += 1
                data.extend(u32(0) + u32(0) + u32(len(am)) + u32(0))
                for m in am: data.extend(u32(MI[(c['name'], m['name'], m['ret'], m['params'])]) + u32(as_off[m['annot']]))
            mapi.append((0x2006, n_ad, o_ad0))
        # --- map
        align4(); o_map = at()
        items = [(0x0000, 1, 0), (0x0001, n_s, o_str), (0x0002, n_t, o_typ), (0x0003, n_p, o_pro), (0x0004, n_f, o_fld), (0x0005, n_m, o_met), (0x0006, n_c, o_cls)] + mapi + [(0x1000, 1, o_map)]
        items = sorted([i for i in items if i[1]], key=lambda i: i[2])
        data.extend(u32(len(items)) + b''.join(u16(t) + u16(0) + u32(n) + u32(o) for t, n, o in items))
        # --- ids
        ids = bytearray()
        ids += b''.join(u32(o) for o in sd_off)
        ids += b''.join(u32(SI[t]) for t in types)
        ids += b''.join(u32(SI[shorty(r, ps)]) + u32(TI[r]) + u32(tl_off[ps] if ps else 0) for r, ps in protos)
        ids += b''.join(u16(TI[c]) + u16(TI[t]) + u32(SI[n]) for c, n, t in fields)
        ids += b''.join(u16(TI[c]) + u16(PI[(r, ps)]) + u32(SI[n]) for c, n, r, ps in meths)
        for c in self.classes:
            ids += u32(TI[c['name']]) + u32(c['access']) + u32(TI[c['sup']]) + u32(0) + u32(0xffffffff) + u32(dir_off.get(c['name'], 0)) + u32(cdata_off[c['name']]) + u32(0)
        assert 0x70 + len(ids) == data_off
        file_size = data_off + len(data)
        hdr = bytearray(b'dex\n035\0' + b'\0' * 24 + u32(file_size) + u32(0x70) + u32(0x12345678) + u32(0) + u32(0) + u32(o_map) +
                        u32(n_s) + u32(o_str) + u32(n_t) + u32(o_typ) + u32(n_p) + u32(o_pro) + u32(n_f) + u32(o_fld) + u32(n_m) + u32(o_met) + u32(n_c) + u32(o_cls) +
                        u32(len(data)) + u32(data_off))
        dex = bytearray(hdr + ids + data)
        dex[12:32] = hashlib.sha1(dex[32:]).digest()
        dex[8:12] = u32(zlib.adler32(bytes(dex[12:])))
        return bytes(dex)


# ======================================================================== checker
# Formats of every opcode we emit: op -> (size in code units, kind)
FMT = {0x12: (1, '11n'), 0x13: (2, '21s'), 0x15: (2, '21h'), 0x1a: (2, '21c-s'), 0x22: (2, '21c-t'), 0x1f: (2, '21c-t'), 0x0a: (1, '11x'), 0x0c: (1, '11x'), 0x0d: (1, '11x'),
       0x0e: (1, '10x'), 0x0f: (1, '11x'), 0x11: (1, '11x'), 0x54: (2, '22c-f'), 0x5b: (2, '22c-f'), 0xd8: (2, '22b'), 0x38: (2, '21t'), 0x39: (2, '21t'), 0x3a: (2, '21t'), 0x3c: (2, '21t'),
       0x29: (2, '20t'), 0x6e: (3, '35c'), 0x6f: (3, '35c'), 0x70: (3, '35c'), 0x71: (3, '35c')}

def check_dex(b):
    """Re-parse a dex we wrote and verify what the runtime's DexFileVerifier checks, plus per-method
    instruction decoding (sizes, register bounds, branch/handler targets, ref indices, invoke arg counts)."""
    R = lambda o: struct.unpack_from('<I', b, o)[0]; H = lambda o: struct.unpack_from('<H', b, o)[0]
    def ruleb(o):
        v = s = 0
        while True:
            x = b[o]; o += 1; v |= (x & 0x7f) << s; s += 7
            if not x & 0x80: return v, o
    def rsleb(o):
        v = s = 0
        while True:
            x = b[o]; o += 1; v |= (x & 0x7f) << s; s += 7
            if not x & 0x80:
                if x & 0x40: v -= 1 << s
                return v, o
    errs = []
    E = errs.append
    assert b[:8] == b'dex\n035\0'
    if R(32) != len(b): E('file size')
    if zlib.adler32(b[12:]) != R(8): E('checksum')
    if hashlib.sha1(b[32:]).digest() != b[12:32]: E('signature')
    n_s, o_s, n_t, o_t, n_p, o_p, n_f, o_f, n_m, o_m, n_c, o_c, dsz, doff = [R(56 + 4 * i) for i in range(14)]
    if doff + dsz != len(b): E('data size')
    strs = []
    for i in range(n_s):
        so = R(o_s + 4 * i); ln, q = ruleb(so); e = b.index(0, q); s = b[q:e].decode('utf-8'); strs.append(s)
        if len(s) != ln: E('string len ' + s)
    if [s.encode('utf-16-be') for s in strs] != sorted(s.encode('utf-16-be') for s in strs) or len(set(strs)) != n_s: E('strings unsorted/dupe')
    typ = [R(o_t + 4 * i) for i in range(n_t)]
    if typ != sorted(set(typ)): E('types unsorted')
    tname = [strs[x] for x in typ]
    protos = []
    for i in range(n_p):
        sh, rt, pl = R(o_p + 12 * i), R(o_p + 12 * i + 4), R(o_p + 12 * i + 8)
        ps = [] if not pl else [H(pl + 4 + 2 * k) for k in range(R(pl))]
        if pl and pl % 4: E('type list align')
        protos.append((rt, ps))
        if strs[sh] != shorty(tname[rt], [tname[x] for x in ps]): E('shorty ' + strs[sh])
    if protos != sorted(protos) or len(set(map(lambda p: (p[0], tuple(p[1])), protos))) != n_p: E('protos unsorted')
    flds = [(H(o_f + 8 * i), H(o_f + 8 * i + 2), R(o_f + 8 * i + 4)) for i in range(n_f)]
    if [(c, n, t) for c, t, n in flds] != sorted((c, n, t) for c, t, n in flds): E('fields unsorted')
    mths = [(H(o_m + 8 * i), H(o_m + 8 * i + 2), R(o_m + 8 * i + 4)) for i in range(n_m)]
    if [(c, n, p) for c, p, n in mths] != sorted((c, n, p) for c, p, n in mths): E('methods unsorted')
    # map
    o_map = R(52); nmap = R(o_map); prev = -1; seen = set()
    for i in range(nmap):
        t, n, o = H(o_map + 4 + 12 * i), R(o_map + 4 + 12 * i + 4), R(o_map + 4 + 12 * i + 8)
        if o <= prev: E('map order'); prev = o
        prev = o
        if t in seen: E('map dupe type')
        seen.add(t)
        if t in (0x2001, 0x1001, 0x1003, 0x2006, 0x1000) and o % 4: E('map align %x' % t)
    ann_t = None
    report = []
    for ci in range(n_c):
        co = o_c + 32 * ci; cls, acc, sup, ifc, src, annd, cdo, sv = [R(co + 4 * k) for k in range(8)]
        cname = tname[cls]
        if not cdo: E('no class data'); continue
        sf, q = ruleb(cdo); inf, q = ruleb(q); dm, q = ruleb(q); vm, q = ruleb(q)
        fi = 0
        for _ in range(inf):
            d, q = ruleb(q); a, q = ruleb(q); fi += d
            if tname[flds[fi][0]] != cname: E('field owner')
        mlist = []
        for group, cnt in (('d', dm), ('v', vm)):
            mi = 0
            for k in range(cnt):
                d, q = ruleb(q); a, q = ruleb(q); c_off, q = ruleb(q)
                if k and d == 0: E('method dupe')
                mi += d; mlist.append((group, mi, a, c_off))
                if tname[mths[mi][0]] != cname: E('method owner ' + strs[mths[mi][2]])
                name = strs[mths[mi][2]]
                if group == 'd' and not (name == '<init>' or a & 0xa): E('non-direct in direct list ' + name)
                if group == 'v' and (name == '<init>' or a & 0xa): E('direct in virtual list ' + name)
                if name == '<init>' and a != 0x10001: E('ctor flags')
        if annd:
            if annd % 4: E('annot dir align')
            cao, nf, nm, npa = R(annd), R(annd + 4), R(annd + 8), R(annd + 12); last = -1
            for k in range(nm):
                mi, so = R(annd + 16 + 8 * k), R(annd + 20 + 8 * k)
                if mi <= last: E('annot methods order')
                last = mi
                if tname[mths[mi][0]] != cname: E('annot method owner')
                if so % 4: E('annot set align')
                for j in range(R(so)):
                    ao = R(so + 4 + 4 * j); vis = b[ao]; at_, _ = ruleb(ao + 1); ann_t = tname[at_]
                    if vis != 1: E('annotation visibility')
        for group, mi, a, c_off in mlist:
            name = strs[mths[mi][2]]; rt, ps = protos[mths[mi][1]]
            regs, ins, outs, ntry, dbg, nins = H(c_off), H(c_off + 2), H(c_off + 4), H(c_off + 6), R(c_off + 8), R(c_off + 12)
            if c_off % 4: E('code align ' + name)
            exp_ins = sum(2 if tname[p] in 'JD' else 1 for p in ps) + (0 if a & 0x8 else 1)
            if ins != exp_ins or regs < ins: E('ins/regs ' + name)
            ip = c_off + 16; starts = set(); addr = 0; targets = []; maxargs = 0; ops = []
            while addr < nins:
                w = H(ip + 2 * addr); op = w & 0xff
                if op not in FMT: E('unknown op %02x in %s' % (op, name)); break
                size, kind = FMT[op]; starts.add(addr); ops.append(op)
                A = (w >> 8) & 0xff; regsused = []
                if kind in ('11n',): regsused = [(w >> 8) & 0xf]
                elif kind in ('21s', '21h', '21c-s', '21c-t', '11x', '21t'): regsused = [A]
                elif kind == '22c-f': regsused = [(w >> 8) & 0xf, (w >> 12) & 0xf]; fi2 = H(ip + 2 * addr + 2); (fi2 < n_f) or E('field idx')
                elif kind == '22b': regsused = [A, H(ip + 2 * addr + 2) & 0xff]
                elif kind == '35c':
                    cnt = w >> 12; mref = H(ip + 2 * addr + 2); g = H(ip + 2 * addr + 4)
                    rr = [g & 0xf, (g >> 4) & 0xf, (g >> 8) & 0xf, (g >> 12) & 0xf, (w >> 8) & 0xf][:cnt]; regsused = rr; maxargs = max(maxargs, cnt)
                    if mref >= n_m: E('method idx')
                    else:
                        mrt, mps = protos[mths[mref][1]]; need = sum(2 if tname[p] in 'JD' else 1 for p in mps) + (0 if op == 0x71 else 1)
                        if need != cnt: E('invoke argc %s -> %s (%d vs %d)' % (name, strs[mths[mref][2]], cnt, need))
                if kind == '21c-s' and H(ip + 2 * addr + 2) >= n_s: E('string idx')
                if kind == '21c-t' and H(ip + 2 * addr + 2) >= n_t: E('type idx')
                for r_ in regsused:
                    if r_ >= regs: E('register v%d out of range in %s' % (r_, name))
                if kind in ('21t', '20t'):
                    off_ = struct.unpack('<h', struct.pack('<H', H(ip + 2 * addr + 2)))[0]; targets.append(addr + off_)
                addr += size
            if addr != nins: E('insns overrun ' + name)
            if maxargs > outs: E('outs too small ' + name)
            for t_ in targets:
                if t_ not in starts: E('branch target %d not an instruction in %s' % (t_, name))
            if ops and ops[-1] not in (0x0e, 0x0f, 0x11, 0x29): E('falls off end ' + name)
            if ntry:
                to = ip + 2 * nins + (2 if nins % 2 else 0); ho = to + 8 * ntry; lastend = -1
                for k in range(ntry):
                    s_, n_, h_ = R(to + 8 * k), H(to + 8 * k + 4), H(to + 8 * k + 6)
                    if s_ < lastend: E('tries overlap ' + name)
                    lastend = s_ + n_
                    if s_ not in starts or (s_ + n_ not in starts and s_ + n_ != nins): E('try bounds ' + name)
                    sz, q2 = rsleb(ho + h_);
                    if sz != 0: E('handler not catch-all')
                    ca, _ = ruleb(q2)
                    if ca not in starts: E('handler addr ' + name)
            report.append('%s.%s%s regs=%d ins=%d outs=%d insns=%d tries=%d' % (cname.split('/')[-1], name, '(' + ''.join(tname[p] for p in ps) + ')' + tname[rt], regs, ins, outs, nins, ntry))
    return errs, report, ann_t
