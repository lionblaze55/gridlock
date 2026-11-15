#!/usr/bin/env python3
"""Independent checks for a hand-built APK: zip/alignment, v2 signature, dex structure + disassembly, AXML decode, arsc decode."""
import struct, sys, zipfile, hashlib, zlib, io
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

apk = open(sys.argv[1], 'rb').read()
R = lambda b, o, f: struct.unpack_from('<' + f, b, o)
ok = True
def bad(m):
    global ok; ok = False; print('  !! ' + m)

# ---------- zip + alignment
z = zipfile.ZipFile(io.BytesIO(apk)); print('ZIP entries:')
for zi in z.infolist():
    lh = zi.header_offset; n, e = R(apk, lh + 26, 'HH'); start = lh + 30 + n + e
    print(f'  {zi.filename:34s} {"stored" if zi.compress_type == 0 else "deflate"} size={zi.file_size} data@{start}' + (' aligned4' if start % 4 == 0 else ''))
    if zi.filename == 'resources.arsc' and (zi.compress_type != 0 or start % 4): bad('resources.arsc must be stored and 4-aligned')
    z.read(zi.filename)  # CRC check
if z.namelist()[0] != 'AndroidManifest.xml': print('  (manifest not first — fine)')

# ---------- v2 signature (re-derived from the spec)
ei = apk.rfind(b'PK\x05\x06'); cd_size, cd_off = R(apk, ei + 12, 'II')
assert apk[cd_off - 16:cd_off] == b'APK Sig Block 42', 'no signing block'
sz2 = R(apk, cd_off - 24, 'Q')[0]; bstart = cd_off - sz2 - 8; assert R(apk, bstart, 'Q')[0] == sz2
p = bstart + 8; v2 = None
while p < cd_off - 24:
    ln, = R(apk, p, 'Q'); pid, = R(apk, p + 8, 'I'); val = apk[p + 12:p + 8 + ln]; p += 8 + ln
    if pid == 0x7109871a: v2 = val
assert v2, 'no v2 block'
def lps(b):
    out, i = [], 0
    while i < len(b): n, = R(b, i, 'I'); out.append(b[i + 4:i + 4 + n]); i += 4 + n
    return out
signer = lps(lps(v2)[0])[0]; signed, sigs, pub = lps(signer)
digests, certs, attrs = lps(signed)
alg, dg = R(lps(digests)[0], 0, 'I')[0], lps(lps(digests)[0][4:])[0]
salg, sig = R(lps(sigs)[0], 0, 'I')[0], lps(lps(sigs)[0][4:])[0]
cert = x509.load_der_x509_certificate(lps(certs)[0]); pk = serialization.load_der_public_key(pub)
assert cert.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo) == pub, 'cert/public key mismatch'
pk.verify(sig, signed, padding.PKCS1v15(), hashes.SHA256())
eocd = bytearray(apk[ei:]); eocd[16:20] = struct.pack('<I', bstart)
chunks = []
for s in (apk[:bstart], apk[cd_off:ei], bytes(eocd)):
    for k in range(0, len(s), 1 << 20): c = s[k:k + (1 << 20)]; chunks.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())
want = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunks)) + b''.join(chunks)).digest()
print(f'V2 SIGNATURE: alg=0x{alg:04x}/0x{salg:04x} digest {"OK" if want == dg else "MISMATCH"}, RSA signature OK, cert "{cert.subject.rfc4514_string()}" sha256={hashlib.sha256(lps(certs)[0]).hexdigest()[:16]}…')
if want != dg: bad('content digest mismatch')

# ---------- dex
d = z.read('classes.dex'); print('DEX:')
if d[:8] != b'dex\n035\0': bad('magic')
if R(d, 8, 'I')[0] != zlib.adler32(d[12:]): bad('checksum')
if d[12:32] != hashlib.sha1(d[32:]).digest(): bad('sha1')
(fsz, hsz, endian, _, _, map_off, ns, so, nt, to, np_, po, nf, fo, nm, mo, nc, co, dsz, doff) = R(d, 32, '20I')
if fsz != len(d) or hsz != 0x70 or endian != 0x12345678: bad('header fields')
if dsz % 4 or doff + dsz != len(d): bad('data section size')
def uleb(o):
    v = sh = 0
    while True:
        b = d[o]; o += 1; v |= (b & 0x7f) << sh; sh += 7
        if not b & 0x80: return v, o
S = []
for i in range(ns):
    o, = R(d, so + 4 * i, 'I'); n, o = uleb(o); s = d[o:o + n].decode(); S.append(s)
    if d[o + n] != 0: bad('string not NUL terminated')
if S != sorted(S): bad('strings not sorted')
TY = [S[R(d, to + 4 * i, 'I')[0]] for i in range(nt)]
if [R(d, to + 4 * i, 'I')[0] for i in range(nt)] != sorted(R(d, to + 4 * i, 'I')[0] for i in range(nt)): bad('types not sorted')
def tlist(o):
    if not o: return ()
    n, = R(d, o, 'I'); return tuple(TY[R(d, o + 4 + 2 * k, 'H')[0]] for k in range(n))
PR = []
for i in range(np_):
    sh, rt, po_ = R(d, po + 12 * i, 'III'); params = tlist(po_); PR.append((TY[rt], params))
    short = ''.join('L' if t[0] in 'L[' else t for t in (TY[rt],) + params)
    if S[sh] != short: bad(f'shorty {S[sh]} != {short}')
keys = [(R(d, po + 12 * i, 'III')[1], [TY.index(t) for t in PR[i][1]]) for i in range(np_)]
if keys != sorted(keys): bad('protos not sorted')
FI = [(TY[R(d, fo + 8 * i, 'HHI')[0]], S[R(d, fo + 8 * i, 'HHI')[2]], TY[R(d, fo + 8 * i, 'HHI')[1]]) for i in range(nf)]
MI = []; mk = []
for i in range(nm):
    c, p_, n = R(d, mo + 8 * i, 'HHI'); MI.append((TY[c], S[n], PR[p_])); mk.append((c, n, p_))
if mk != sorted(mk): bad('methods not sorted')
print(f'  {ns} strings, {nt} types, {np_} protos, {nf} fields, {nm} methods')
cls, acc, sup, itf, src, ann, cdo, sv = R(d, co, '8I'); print(f'  class {TY[cls]} extends {TY[sup]} access=0x{acc:x}')
o = cdo; sf, o = uleb(o); inf, o = uleb(o); dm, o = uleb(o); vm, o = uleb(o)
fidx = 0
for _ in range(inf): x, o = uleb(o); a, o = uleb(o); fidx += x; print(f'  field {FI[fidx][1]}:{FI[fidx][2]} access=0x{a:x}')
NAMES = {0x6e: 'invoke-virtual', 0x6f: 'invoke-super', 0x70: 'invoke-direct'}
def dis(code_off):
    regs, ins, outs, tries, dbg, n = R(d, code_off, 'HHHHII'); u = [R(d, code_off + 16 + 2 * k, 'H')[0] for k in range(n)]; i = 0; out = []
    if code_off % 4: bad('code item not aligned')
    maxargs = 0
    while i < n:
        op = u[i] & 0xff; aa = u[i] >> 8
        if op in NAMES:
            A = u[i] >> 12; G = (u[i] >> 8) & 0xf; m = MI[u[i + 1]]; r = [u[i + 2] & 0xf, (u[i + 2] >> 4) & 0xf, (u[i + 2] >> 8) & 0xf, u[i + 2] >> 12, G][:A]
            exp = (0 if NAMES[op] == 'invoke-static' else 1) + len(m[2][1]); maxargs = max(maxargs, A)
            if A != exp: bad(f'arg count {A} != {exp} for {m[1]}')
            if max(r) >= regs: bad('register out of range')
            out.append(f'{i:3d} {NAMES[op]} {{{",".join("v%d" % x for x in r)}}} {m[0]}->{m[1]}{m[2]}'); i += 3
        elif op == 0x0c: out.append(f'{i:3d} move-result-object v{aa}'); i += 1
        elif op == 0x0e: out.append(f'{i:3d} return-void'); i += 1
        elif op == 0x12: out.append(f'{i:3d} const/4 v{(u[i] >> 8) & 0xf}, {u[i] >> 12}'); i += 1
        elif op == 0x13: out.append(f'{i:3d} const/16 v{aa}, 0x{u[i + 1]:x}'); i += 2
        elif op == 0x1a: out.append(f'{i:3d} const-string v{aa}, "{S[u[i + 1]]}"'); i += 2
        elif op == 0x22: out.append(f'{i:3d} new-instance v{aa}, {TY[u[i + 1]]}'); i += 2
        elif op in (0x54, 0x5b): out.append(f'{i:3d} {"iget" if op == 0x54 else "iput"}-object v{(u[i] >> 8) & 0xf}, v{u[i] >> 12}, {FI[u[i + 1]]}'); i += 2
        elif op == 0x38: t = i + (u[i + 1] - 0x10000 if u[i + 1] & 0x8000 else u[i + 1]); out.append(f'{i:3d} if-eqz v{aa}, -> {t}'); i += 2
        else: bad(f'unknown op {op:02x}'); break
    if outs < maxargs: bad('outs too small')
    if ins > regs: bad('ins > regs')
    return f'regs={regs} ins={ins} outs={outs}', out
midx = 0
for kind, cnt in (('direct', dm), ('virtual', vm)):
    midx = 0
    for _ in range(cnt):
        x, o = uleb(o); a, o = uleb(o); c_, o = uleb(o); midx += x; m = MI[midx]
        if m[0] != TY[cls]: bad('method of another class in class_data')
        hdr, lines = dis(c_); print(f'  {kind} {m[1]}{m[2]} access=0x{a:x} {hdr}')
        for l in lines: print('      ' + l)
# map list covers sections in order
nmap, = R(d, map_off, 'I'); offs = [R(d, map_off + 4 + 12 * k, 'HHII')[3] for k in range(nmap)]
if offs != sorted(offs): bad('map not sorted by offset')

# ---------- AXML
m = z.read('AndroidManifest.xml'); print('MANIFEST:')
def pool(b, o):
    t, hs, size, cnt, sty, flags, ss, sts = R(b, o, 'HHIIIIII'); out = []
    for i in range(cnt):
        so_, = R(b, o + hs + 4 * i, 'I'); p_ = o + ss + so_; n, = R(b, p_, 'H'); out.append(b[p_ + 2:p_ + 2 + 2 * n].decode('utf-16-le'))
    return out, size
t, hs, total = R(m, 0, 'HHI'); assert t == 3 and total == len(m)
P, psz = pool(m, 8); o = 8 + psz; rmap = []
depth = 0; NSU = None
while o < len(m):
    t, hs, size = R(m, o, 'HHI')
    if t == 0x180: rmap = [R(m, o + 8 + 4 * k, 'I')[0] for k in range((size - 8) // 4)]
    elif t == 0x100: NSU = P[R(m, o + 20, 'I')[0]]
    elif t == 0x102:
        ns_, name, ast, asz, ac = R(m, o + 16, 'IIHHH'); attrs = []; ids = []
        for k in range(ac):
            ans, an, raw, vs, r0, dt, data = R(m, o + 36 + 20 * k, 'IIIHBBI'); rid = rmap[an] if an < len(rmap) else 0
            if ans != 0xffffffff: ids.append(rid)
            val = P[data] if dt == 3 else ('@0x%08x' % data if dt == 1 else ('true' if data else 'false') if dt == 0x12 else hex(data) if dt == 0x11 else str(data))
            attrs.append(f'{"android:" if ans != 0xffffffff else ""}{P[an]}="{val}"' + (f'[0x{rid:08x}]' if rid else ''))
        if ids != sorted(ids): bad(f'attributes of <{P[name]}> not sorted by id')
        print('  ' + '  ' * depth + f'<{P[name]} ' + ' '.join(attrs) + '>'); depth += 1
    elif t == 0x103: depth -= 1
    o += size
# ---------- arsc
a = z.read('resources.arsc'); t, hs, size, pc = R(a, 0, 'HHII'); assert t == 2 and size == len(a) and pc == 1
G, gsz = pool(a, 12); po = 12 + gsz; t, hs, psz, pid = R(a, po, 'HHII'); pname = a[po + 12:po + 12 + 256].decode('utf-16-le').rstrip('\0')
tso, lpt, kso, lpk = R(a, po + 268, 'IIII'); TS, _ = pool(a, po + tso); KS, _ = pool(a, po + kso)
o = po + hs + (kso - hs) + R(a, po + kso + 4, 'I')[0]
while o < po + psz:
    t, hs_, sz = R(a, o, 'HHI')
    if t == 0x201:
        tid, fl, _, ec, es = R(a, o + 8, 'BBHII'); dens, = R(a, o + 20 + 14, 'H'); eo, = R(a, o + hs_, 'I'); e = o + es + eo
        esz, efl, key, vsz, _, dt, data = R(a, e, 'HHIHBBI')
        print(f'RESOURCES: package 0x{pid:02x} "{pname}"  0x{pid:02x}{tid:02x}{0:04x} {TS[tid - 1]}/{KS[key]} = "{G[data]}" density=0x{dens:x}')
        if G[data] not in z.namelist(): bad('arsc path not in zip')
    o += sz
print('ALL CHECKS PASSED' if ok else 'PROBLEMS FOUND')
